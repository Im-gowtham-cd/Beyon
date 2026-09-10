from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.routers.laptop_analysis import router as laptop_router
from app.routers.mobile_analysis import router as mobile_router
from app.routers.audio_analysis import router as audio_router
from app.routers.recommendations import router as recommendations_router

app = FastAPI(
    title="Beyon Skill Intelligence & DualView AI Service",
    description="Skill profiling, closed-loop recommendations, and multi-camera proctoring",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(laptop_router)
app.include_router(mobile_router)
app.include_router(audio_router)
app.include_router(recommendations_router)

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "beyon-dualview-ai",
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": ["face_tracking", "secondary_device_detection", "acoustic_classification"]
    }

@app.get("/")
async def root():
    return {"message": "Beyon DualView AI Proctoring Engine"}