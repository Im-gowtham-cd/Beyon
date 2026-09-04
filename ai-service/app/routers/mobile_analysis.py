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
                cameraObstructed=True, candidateAbsent=False,
                events=[DetectionEvent(eventType="CAMERA_OBSTRUCTION", confidence=0.95, metadata={"reason": "invalid_frame"})]
            )

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_brightness = float(np.mean(gray))
        gray_std = float(np.std(gray))
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        b_mean = float(np.mean(img[:, :, 0]))
        g_mean = float(np.mean(img[:, :, 1]))
        r_mean = float(np.mean(img[:, :, 2]))

        # --- CAMERA OBSTRUCTION / COVERED LENS DETECTION ---
        # 1. Darkness: camera covered by opaque surface/object/dark cloth
        is_dark = mean_brightness < 20.0
        # 2. Extreme defocus + low contrast (finger or object flush against lens)
        is_blurred_flat = (laplacian_var < 18.0) and (gray_std < 24.0 or mean_brightness < 40.0)
        # 3. Finger covering lens (flesh blood-flow red dominance with near-zero spatial edge variance)
        is_finger_on_lens = (r_mean > 1.4 * max(b_mean, 1.0)) and (r_mean > 1.2 * max(g_mean, 1.0)) and (laplacian_var < 30.0) and (gray_std < 32.0)
        # 4. Overexposed uniform blowout
        is_blowout = (mean_brightness > 248.0) and (gray_std < 10.0)

        camera_obstructed = is_dark or is_blurred_flat or is_finger_on_lens or is_blowout
        if camera_obstructed:
            events.append(DetectionEvent(
                eventType="CAMERA_OBSTRUCTION",
                confidence=0.96,
                metadata={
                    "mean_brightness": round(mean_brightness, 2),
                    "laplacian_var": round(laplacian_var, 2),
                    "is_finger": is_finger_on_lens
                }
            ))
            return MobileFrameResponse(
                personCount=0,
                secondaryDeviceDetected=False,
                detectedObjects=[],
                confidence=0.96,
                cameraObstructed=True,
                candidateAbsent=False,
                events=events
            )

        # --- CANDIDATE & PERSON DETECTION ---
        ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
        lower_skin = np.array([0, 133, 77], dtype=np.uint8)
        upper_skin = np.array([255, 173, 127], dtype=np.uint8)
        skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)

        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel, iterations=2)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_DILATE, kernel, iterations=2)
        contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Candidate heads: upper 45% of frame (arms/hands on desk are in y > 0.45 * h)
        head_candidates = []
        min_head_area = 0.035 * (w * h)
        for c in contours:
            area = cv2.contourArea(c)
            if area > min_head_area:
                x, y, cw, ch = cv2.boundingRect(c)
                if y < 0.45 * h:
                    aspect = float(ch) / max(float(cw), 1.0)
                    if 0.8 <= aspect <= 2.2:
                        cx = x + cw / 2.0
                        cy = y + ch / 2.0
                        head_candidates.append({
                            "bbox": (x, y, cw, ch),
                            "center": (cx, cy),
                            "area": area
                        })

        person_count = 0
        if len(head_candidates) == 1:
            person_count = 1
            detected_objects.append(DetectedObject(label="person", confidence=0.92))
        elif len(head_candidates) >= 2:
            head_candidates.sort(key=lambda item: item["area"], reverse=True)
            primary_head = head_candidates[0]
            primary_cx = primary_head["center"][0]

            has_genuine_second_head = False
            for other in head_candidates[1:]:
                other_cx = other["center"][0]
                if abs(primary_cx - other_cx) > (0.35 * w):
                    has_genuine_second_head = True
                    break

            if has_genuine_second_head:
                person_count = 2
                events.append(DetectionEvent(eventType="SECOND_PERSON", confidence=0.92, metadata={"count": 2}))
                detected_objects.append(DetectedObject(label="person", confidence=0.92))
            else:
                person_count = 1
                detected_objects.append(DetectedObject(label="person", confidence=0.92))
        elif len(contours) > 0:
            total_skin_area = sum(cv2.contourArea(c) for c in contours)
            if total_skin_area > 0.03 * (w * h):
                person_count = 1
                detected_objects.append(DetectedObject(label="person", confidence=0.88))

        # Check candidate absence: no person detected in viewport
        candidate_absent = (person_count == 0)
        if candidate_absent:
            events.append(DetectionEvent(
                eventType="NO_PERSON_DETECTED",
                confidence=0.95,
                metadata={"reason": "candidate_left_workspace"}
            ))

        # --- SECONDARY DEVICE SCREEN DETECTION ---
        secondary_device = False
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, bright_thresh = cv2.threshold(blurred, 220, 255, cv2.THRESH_BINARY)
        screen_contours, _ = cv2.findContours(bright_thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        for c in screen_contours:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.05 * peri, True)
            if len(approx) == 4:
                (x, y, cw, ch) = cv2.boundingRect(approx)
                area = cw * ch
                if 0.03 * (w * h) < area < 0.12 * (w * h):
                    aspect = float(max(cw, ch)) / max(float(min(cw, ch)), 1.0)
                    if 1.6 <= aspect <= 2.3:
                        mask = np.zeros(gray.shape, dtype=np.uint8)
                        cv2.drawContours(mask, [c], -1, 255, -1)
                        mean_val = cv2.mean(gray, mask=mask)[0]
                        if mean_val > 215:
                            secondary_device = True
                            detected_objects.append(DetectedObject(label="phone", confidence=0.92, bbox=[x, y, cw, ch]))
                            events.append(DetectionEvent(eventType="PHONE_DETECTED", confidence=0.92, metadata={"bbox": [x, y, cw, ch]}))
                            break

        return MobileFrameResponse(
            personCount=person_count,
            secondaryDeviceDetected=secondary_device,
            detectedObjects=detected_objects,
            confidence=0.92,
            cameraObstructed=False,
            candidateAbsent=candidate_absent,
            events=events
        )

    except Exception as e:
        return MobileFrameResponse(
            personCount=0, secondaryDeviceDetected=False,
            detectedObjects=[], confidence=0.0,
            cameraObstructed=False, candidateAbsent=False,
            events=[DetectionEvent(eventType="ANALYSIS_ERROR", confidence=1.0, metadata={"error": str(e)})]
        )