from fastapi import APIRouter
from app.schemas import AudioChunkRequest, AudioChunkResponse, DetectionEvent

router = APIRouter(prefix="/analyze", tags=["audio"])

@router.post("/audio-chunk", response_model=AudioChunkResponse)
async def analyze_audio_chunk(req: AudioChunkRequest):
    events = []
    rms = req.rmsLevel or 0.0
    voice_active = rms > 30.0
    second_voice = False

    # Elevated sustained audio with speech energy implies conversation
    if rms > 55.0:
        second_voice = True
        events.append(DetectionEvent(
            eventType="SUSPICIOUS_SPEECH",
            confidence=0.88,
            cameraSource="MICROPHONE",
            metadata={"rms": rms, "speechActivity": "CONVERSATION_DETECTED"}
        ))
    elif voice_active:
        events.append(DetectionEvent(
            eventType="SUSPICIOUS_SPEECH",
            confidence=0.75,
            cameraSource="MICROPHONE",
            metadata={"rms": rms, "speechActivity": "VOICE_DETECTED"}
        ))

    return AudioChunkResponse(
        voiceActivity=voice_active,
        secondVoiceSuspected=second_voice,
        rmsLevel=rms,
        confidence=0.85,
        events=events
    )