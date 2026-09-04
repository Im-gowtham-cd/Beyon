from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LaptopFrameRequest(BaseModel):
    frameData: str = Field(..., description="Base64 encoded JPEG or PNG image")
    currentQuestionId: Optional[str] = None
    timestamp: Optional[int] = None

class DetectionEvent(BaseModel):
    eventType: str
    confidence: float
    metadata: Optional[Dict[str, Any]] = None

class LaptopFrameResponse(BaseModel):
    facePresent: bool
    faceCount: int
    headPose: str  # "CENTER", "LEFT", "RIGHT", "UP", "DOWN"
    gazeDirection: str  # "CENTER", "LEFT", "RIGHT", "UP", "DOWN"
    confidence: float
    events: List[DetectionEvent]

class MobileFrameRequest(BaseModel):
    frameData: str = Field(..., description="Base64 encoded JPEG or PNG image")
    currentQuestionId: Optional[str] = None
    timestamp: Optional[int] = None

class DetectedObject(BaseModel):
    label: str  # "phone", "person", "laptop", "tablet", "book"
    confidence: float
    bbox: Optional[List[int]] = None  # [x, y, w, h]

class MobileFrameResponse(BaseModel):
    personCount: int
    secondaryDeviceDetected: bool
    detectedObjects: List[DetectedObject]
    confidence: float
    events: List[DetectionEvent]
    cameraObstructed: Optional[bool] = False
    candidateAbsent: Optional[bool] = False

class AudioChunkRequest(BaseModel):
    audioData: Optional[str] = None  # Base64 encoded audio or WAV
    rmsLevel: Optional[float] = None
    timestamp: Optional[int] = None

class AudioChunkResponse(BaseModel):
    voiceActivity: bool
    secondVoiceSuspected: bool
    rmsLevel: float
    confidence: float
    events: List[DetectionEvent]