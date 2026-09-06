from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LaptopFrameRequest(BaseModel):
    frameData: str = Field(..., description="Base64 encoded JPEG or PNG image")
    currentQuestionId: Optional[str] = None
    timestamp: Optional[int] = None

class DetectionEvent(BaseModel):
    eventType: str
    confidence: float
    cameraSource: Optional[str] = "LAPTOP_FRONT"
    durationSeconds: Optional[float] = 0.0
    timestampMs: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class LaptopFrameResponse(BaseModel):
    facePresent: bool
    faceCount: int
    headPose: str
    gazeDirection: str
    confidence: float
    events: List[DetectionEvent]

class MobileFrameRequest(BaseModel):
    frameData: str = Field(..., description="Base64 encoded JPEG or PNG image")
    currentQuestionId: Optional[str] = None
    timestamp: Optional[int] = None

class DetectedObject(BaseModel):
    label: str
    confidence: float
    bbox: Optional[List[int]] = None

class MobileFrameResponse(BaseModel):
    personCount: int
    secondaryDeviceDetected: bool
    detectedObjects: List[DetectedObject]
    confidence: float
    events: List[DetectionEvent]
    cameraObstructed: Optional[bool] = False
    candidateAbsent: Optional[bool] = False

class AudioChunkRequest(BaseModel):
    audioData: Optional[str] = None
    rmsLevel: Optional[float] = None
    frequencyData: Optional[List[float]] = None
    timestamp: Optional[int] = None

class AudioChunkResponse(BaseModel):
    voiceActivity: bool
    secondVoiceSuspected: bool
    rmsLevel: float
    confidence: float
    events: List[DetectionEvent]