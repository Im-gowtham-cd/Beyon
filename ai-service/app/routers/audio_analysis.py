from fastapi import APIRouter
from app.schemas import AudioChunkRequest, AudioChunkResponse, DetectionEvent

router = APIRouter(prefix="/analyze", tags=["audio"])

@router.post("/audio-chunk", response_model=AudioChunkResponse)
async def analyze_audio_chunk(req: AudioChunkRequest):
    events = []
    rms = req.rmsLevel or 0.0
    voice_active = rms > 30.0
    second_voice = False

    # Elevated sustained audio with pitch variation implies conversation
    if rms > 55.0:
        second_voice = True
        events.append(DetectionEvent(eventType="SECOND_VOICE", confidence=0.85, metadata={"rms": rms}))
        events.append(DetectionEvent(eventType="CONVERSATION_SUSPECTED", confidence=0.80, metadata={"rms": rms}))
    elif voice_active:
        events.append(DetectionEvent(eventType="VOICE_DETECTED", confidence=0.75, metadata={"rms": rms}))

    return AudioChunkResponse(
        voiceActivity=voice_active,
        secondVoiceSuspected=second_voice,
        rmsLevel=rms,
        confidence=0.85,
        events=events
    )