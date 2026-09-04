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
                events=[DetectionEvent(eventType="CAMERA_COVERED", confidence=0.9)]
            )

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_brightness = float(np.mean(gray))

        # Camera cover / obstruction check
        if mean_brightness < 12.0:
            events.append(DetectionEvent(eventType="CAMERA_COVERED", confidence=0.95, metadata={"meanBrightness": mean_brightness}))
            return LaptopFrameResponse(
                facePresent=False, faceCount=0, headPose="CENTER",
                gazeDirection="CENTER", confidence=0.95, events=events
            )

        # Skin tone detection in YCrCb color space
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
                if 0.9 <= aspect <= 2.2:
                    face_contours.append((x, y, cw, ch, area))

        face_count = len(face_contours)
        face_present = face_count > 0
        head_pose = "CENTER"
        gaze_direction = "CENTER"
        confidence = 0.88

        if face_count == 0:
            events.append(DetectionEvent(eventType="FACE_MISSING", confidence=0.88))
        elif face_count > 1:
            events.append(DetectionEvent(eventType="MULTIPLE_FACES", confidence=0.92, metadata={"count": face_count}))
        else:
            x, y, cw, ch, _ = face_contours[0]
            face_center_x = x + cw / 2.0
            frame_center_x = w / 2.0
            x_offset = (face_center_x - frame_center_x) / (w / 2.0)

            if x_offset < -0.30:
                head_pose = "LEFT"
                gaze_direction = "LEFT"
                events.append(DetectionEvent(eventType="CANDIDATE_GAZE_TOWARD_HELPER", confidence=0.88, metadata={"offset": float(x_offset)}))
            elif x_offset > 0.30:
                head_pose = "RIGHT"
                gaze_direction = "RIGHT"
                events.append(DetectionEvent(eventType="CANDIDATE_GAZE_TOWARD_HELPER", confidence=0.88, metadata={"offset": float(x_offset)}))

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