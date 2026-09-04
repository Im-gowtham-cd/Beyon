import base64
import cv2
import numpy as np
from fastapi import APIRouter
from app.schemas import MobileFrameRequest, MobileFrameResponse, DetectedObject, DetectionEvent

router = APIRouter(prefix="/analyze", tags=["mobile"])

def decode_image(base64_str: str) -> np.ndarray:
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    img_bytes = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

@router.post("/mobile-frame", response_model=MobileFrameResponse)
async def analyze_mobile_frame(req: MobileFrameRequest):
    events = []
    detected_objects = []
    try:
        img = decode_image(req.frameData)
        if img is None:
            return MobileFrameResponse(
                personCount=0, secondaryDeviceDetected=False,
                detectedObjects=[], confidence=0.0,
                events=[DetectionEvent(eventType="CAMERA_OBSTRUCTION", confidence=0.9)]
            )

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_brightness = float(np.mean(gray))

        # Camera cover / obstruction check
        if mean_brightness < 10.0:
            events.append(DetectionEvent(eventType="CAMERA_OBSTRUCTION", confidence=0.92))

        # Person detection via skin regions
        ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        lower_skin = np.array([0, 133, 77], dtype=np.uint8)
        upper_skin = np.array([255, 173, 127], dtype=np.uint8)
        skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel, iterations=2)
        contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        person_count = 0
        min_person_area = 0.02 * (w * h)
        for c in contours:
            if cv2.contourArea(c) > min_person_area:
                person_count += 1

        if person_count > 1:
            events.append(DetectionEvent(eventType="SECOND_PERSON", confidence=0.90, metadata={"count": person_count}))
            detected_objects.append(DetectedObject(label="person", confidence=0.90))

        # Secondary phone screen detection (glowing rectangle with aspect ratio ~ 1.5 - 2.4)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        screen_contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        secondary_device = False
        for c in screen_contours:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.04 * peri, True)
            if len(approx) == 4:
                (x, y, cw, ch) = cv2.boundingRect(approx)
                area = cw * ch
                if 0.015 * (w * h) < area < 0.25 * (w * h):
                    aspect = float(max(cw, ch)) / max(float(min(cw, ch)), 1.0)
                    if 1.5 <= aspect <= 2.4:
                        secondary_device = True
                        detected_objects.append(DetectedObject(label="phone", confidence=0.86, bbox=[x, y, cw, ch]))
                        events.append(DetectionEvent(eventType="PHONE_DETECTED", confidence=0.86, metadata={"bbox": [x, y, cw, ch]}))

                        # If located toward center or right
                        if x + cw > w * 0.35:
                            events.append(DetectionEvent(eventType="PHONE_TOWARD_LAPTOP", confidence=0.83))
                        break

        return MobileFrameResponse(
            personCount=person_count,
            secondaryDeviceDetected=secondary_device,
            detectedObjects=detected_objects,
            confidence=0.88,
            events=events
        )

    except Exception as e:
        return MobileFrameResponse(
            personCount=0, secondaryDeviceDetected=False,
            detectedObjects=[], confidence=0.0,
            events=[DetectionEvent(eventType="ANALYSIS_ERROR", confidence=1.0, metadata={"error": str(e)})]
        )