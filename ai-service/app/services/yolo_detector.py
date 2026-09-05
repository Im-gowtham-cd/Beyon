import logging
import numpy as np
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

# Singleton YOLO Model instance
_yolo_model = None
_yolo_available = None

def get_yolo_model():
    global _yolo_model, _yolo_available
    if _yolo_available is False:
        return None
    if _yolo_model is not None:
        return _yolo_model
    
    try:
        from ultralytics import YOLO
        # Use YOLO11 nano model or YOLOv8 nano model (lightweight, highly accurate ~6MB)
        try:
            _yolo_model = YOLO("yolo11n.pt")
            logger.info("Loaded YOLO11 nano proctoring model successfully")
        except Exception:
            _yolo_model = YOLO("yolov8n.pt")
            logger.info("Loaded YOLOv8 nano proctoring model successfully")
        _yolo_available = True
        return _yolo_model
    except Exception as e:
        logger.warning(f"Ultralytics YOLO not yet loaded: {e}. Using robust CV detector fallback.")
        _yolo_available = False
        return None


def detect_objects_yolo(image_bgr: np.ndarray) -> Tuple[int, bool, List[Dict[str, Any]]]:
    """
    Runs YOLO object detection on the provided BGR image.
    Returns:
      (person_count, cell_phone_detected, detected_objects_list)
    """
    model = get_yolo_model()
    if model is None or image_bgr is None:
        return 1, False, []

    h, w = image_bgr.shape[:2]
    total_area = w * h

    person_count = 0
    cell_phone_detected = False
    detected_objects = []

    try:
        # Run inference with conf=0.50
        results = model(image_bgr, conf=0.50, verbose=False)
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                label = model.names[cls_id].lower()
                xyxy = box.xyxy[0].tolist()
                bx, by, bx2, by2 = xyxy
                bw = bx2 - bx
                bh = by2 - by
                box_area = bw * bh

                # Human Person Detection
                if label == "person" and conf >= 0.55:
                    if box_area > 0.02 * total_area:
                        person_count += 1
                        detected_objects.append({
                            "label": "person",
                            "confidence": round(conf, 3),
                            "bbox": [int(bx), int(by), int(bw), int(bh)]
                        })

                # Cell Phone Detection: Target COCO "cell phone" class
                elif label in ["cell phone", "phone", "mobile phone"] and conf >= 0.60:
                    # Ignore tiny specks or full screen anomalies
                    if 0.005 * total_area < box_area < 0.40 * total_area:
                        cell_phone_detected = True
                        detected_objects.append({
                            "label": "phone",
                            "confidence": round(conf, 3),
                            "bbox": [int(bx), int(by), int(bw), int(bh)]
                        })

                # Also capture secondary laptops/monitors or tablets if relevant
                elif label in ["laptop", "tablet", "tv"] and conf >= 0.65:
                    detected_objects.append({
                        "label": label,
                        "confidence": round(conf, 3),
                        "bbox": [int(bx), int(by), int(bw), int(bh)]
                    })

    except Exception as e:
        logger.error(f"Error during YOLO inference: {e}")

    return person_count, cell_phone_detected, detected_objects
