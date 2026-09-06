import logging
import cv2
import numpy as np
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

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
    Runs enhanced YOLO object detection + Computer Vision geometric screen analysis.
    Returns:
      (person_count, cell_phone_detected, detected_objects_list)
    """
    if image_bgr is None:
        return 0, False, []

    h, w = image_bgr.shape[:2]
    total_area = w * h

    person_count = 0
    cell_phone_detected = False
    detected_objects = []

    model = get_yolo_model()
    if model is not None:
        try:
            results = model(image_bgr, conf=0.25, verbose=False)
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

                    if label == "person" and conf >= 0.45:
                        if box_area > 0.015 * total_area:
                            person_count += 1
                            detected_objects.append({
                                "label": "person",
                                "confidence": round(conf, 3),
                                "bbox": [int(bx), int(by), int(bw), int(bh)]
                            })

                    elif (label in ["cell phone", "phone", "mobile phone", "smartphone"] and conf >= 0.28) or                          (label in ["remote", "gadget"] and conf >= 0.35):
                        if 0.003 * total_area < box_area < 0.45 * total_area:
                            cell_phone_detected = True
                            detected_objects.append({
                                "label": "phone",
                                "confidence": round(conf, 3),
                                "bbox": [int(bx), int(by), int(bw), int(bh)],
                                "model_class": label
                            })

                    elif label in ["laptop", "tv", "tablet"] and conf >= 0.50:
                        detected_objects.append({
                            "label": label,
                            "confidence": round(conf, 3),
                            "bbox": [int(bx), int(by), int(bw), int(bh)]
                        })

        except Exception as e:
            logger.error(f"Error during YOLO inference: {e}")

    if not cell_phone_detected:
        try:
            gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            edges = cv2.Canny(blurred, 50, 150)

            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            dilated = cv2.dilate(edges, kernel, iterations=1)
            contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for c in contours:
                area = cv2.contourArea(c)
                if 0.005 * total_area < area < 0.15 * total_area:
                    peri = cv2.arcLength(c, True)
                    approx = cv2.approxPolyDP(c, 0.04 * peri, True)

                    if len(approx) == 4:
                        x, y, cw, ch = cv2.boundingRect(approx)
                        aspect = float(max(cw, ch)) / max(float(min(cw, ch)), 1.0)

                        if 1.6 <= aspect <= 2.4:
                            roi = gray[y:y+ch, x:x+cw]
                            roi_std = float(np.std(roi))
                            roi_mean = float(np.mean(roi))

                            if roi_std > 20.0 and (roi_mean < 80.0 or roi_mean > 160.0):
                                cell_phone_detected = True
                                detected_objects.append({
                                    "label": "phone",
                                    "confidence": 0.88,
                                    "bbox": [int(x), int(y), int(cw), int(ch)],
                                    "source": "cv_geometry_screen"
                                })
                                break
        except Exception as e:
            logger.debug(f"CV geometric phone detector: {e}")

    return person_count, cell_phone_detected, detected_objects
