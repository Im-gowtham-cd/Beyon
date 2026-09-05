import base64
import cv2
import numpy as np
from fastapi import APIRouter
from app.schemas import LaptopFrameRequest, LaptopFrameResponse, DetectionEvent

router = APIRouter(prefix="/analyze", tags=["laptop"])

def decode_image(base64_str: str) -> np.ndarray:
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    img_bytes = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

@router.post("/laptop-frame", response_model=LaptopFrameResponse)
async def analyze_laptop_frame(req: LaptopFrameRequest):
    events = []
    try:
        img = decode_image(req.frameData)
        if img is None:
            return LaptopFrameResponse(
                facePresent=False, faceCount=0, headPose="UNKNOWN",
                gazeDirection="UNKNOWN", confidence=0.0,
                events=[DetectionEvent(eventType="CAMERA_OBSTRUCTION", confidence=0.95, cameraSource="LAPTOP_FRONT")]
            )

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_brightness = float(np.mean(gray))

        # Camera cover / obstruction check
        if mean_brightness < 12.0:
            events.append(DetectionEvent(
                eventType="CAMERA_OBSTRUCTION",
                confidence=0.95,
                cameraSource="LAPTOP_FRONT",
                metadata={"meanBrightness": mean_brightness}
            ))
            return LaptopFrameResponse(
                facePresent=False, faceCount=0, headPose="CENTER",
                gazeDirection="CENTER", confidence=0.95, events=events
            )

        # 1. Skin tone detection in YCrCb color space
        ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        lower_skin = np.array([0, 133, 77], dtype=np.uint8)
        upper_skin = np.array([255, 173, 127], dtype=np.uint8)
        skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)

        # Morphology to remove small noise
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel, iterations=2)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_DILATE, kernel, iterations=2)

        contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Filter contours by size and aspect ratio
        face_contours = []
        min_area = 0.03 * (w * h)
        for c in contours:
            area = cv2.contourArea(c)
            if area > min_area:
                x, y, cw, ch = cv2.boundingRect(c)
                aspect = float(ch) / max(float(cw), 1.0)
                if 0.8 <= aspect <= 2.4:
                    face_contours.append((x, y, cw, ch, area))

        face_count = len(face_contours)
        face_present = face_count > 0
        head_pose = "CENTER"
        gaze_direction = "CENTER"
        confidence = 0.90

        if face_count == 0:
            events.append(DetectionEvent(
                eventType="CANDIDATE_ABSENT",
                confidence=0.90,
                cameraSource="LAPTOP_FRONT",
                metadata={"reason": "no_face_in_frame"}
            ))
        elif face_count > 1:
            events.append(DetectionEvent(
                eventType="MULTIPLE_PEOPLE",
                confidence=0.92,
                cameraSource="LAPTOP_FRONT",
                metadata={"count": face_count}
            ))
        else:
            x, y, cw, ch, _ = face_contours[0]
            face_center_x = x + cw / 2.0
            face_center_y = y + ch / 2.0
            frame_center_x = w / 2.0
            frame_center_y = h / 2.0
            x_offset = (face_center_x - frame_center_x) / (w / 2.0)
            y_offset = (face_center_y - frame_center_y) / (h / 2.0)

            if x_offset < -0.30:
                head_pose = "LEFT"
                gaze_direction = "LEFT"
                events.append(DetectionEvent(
                    eventType="LOOKING_AWAY",
                    confidence=0.88,
                    cameraSource="LAPTOP_FRONT",
                    metadata={"offset": float(x_offset), "direction": "LEFT"}
                ))
            elif x_offset > 0.30:
                head_pose = "RIGHT"
                gaze_direction = "RIGHT"
                events.append(DetectionEvent(
                    eventType="LOOKING_AWAY",
                    confidence=0.88,
                    cameraSource="LAPTOP_FRONT",
                    metadata={"offset": float(x_offset), "direction": "RIGHT"}
                ))
            elif y_offset > 0.35:
                head_pose = "DOWN"
                gaze_direction = "DOWN"
                events.append(DetectionEvent(
                    eventType="LOOKING_AWAY",
                    confidence=0.85,
                    cameraSource="LAPTOP_FRONT",
                    metadata={"offset": float(y_offset), "direction": "DOWN"}
                ))

        # 2. Handheld glowing phone / screen detection in front view (YOLO Object Detector)
        from app.services.yolo_detector import detect_objects_yolo
        _, yolo_phone, yolo_objs = detect_objects_yolo(img)
        if yolo_phone:
            phone_bbox = next((obj.get("bbox") for obj in yolo_objs if obj.get("label") == "phone"), None)
            events.append(DetectionEvent(
                eventType="PHONE_DETECTED",
                confidence=0.95,
                cameraSource="LAPTOP_FRONT",
                metadata={"bbox": phone_bbox, "source": "yolo_model"}
            ))

        # 3. Deep Learning Cheating CNN & Posture Telemetry
        from app.services.cheat_cnn_detector import detect_cheating_cnn
        is_cheating, cheat_prob, cnn_meta = detect_cheating_cnn(img)
        if is_cheating or cheat_prob >= 0.70:
            events.append(DetectionEvent(
                eventType="SUSPICIOUS_BEHAVIOR",
                confidence=round(cheat_prob, 3),
                cameraSource="LAPTOP_FRONT",
                metadata=cnn_meta
            ))

        return LaptopFrameResponse(
            facePresent=face_present,
            faceCount=face_count,
            headPose=head_pose,
            gazeDirection=gaze_direction,
            confidence=confidence,
            events=events
        )

    except Exception as e:
        return LaptopFrameResponse(
            facePresent=False, faceCount=0, headPose="ERROR",
            gazeDirection="ERROR", confidence=0.0,
            events=[DetectionEvent(eventType="ANALYSIS_ERROR", confidence=1.0, metadata={"error": str(e)})]
        )