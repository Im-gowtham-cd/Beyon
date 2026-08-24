from fastapi import FastAPI
from datetime import datetime

app = FastAPI(
    title="Beyon AI Service",
    description="AI service for Beyon platform",
    version="0.1.0",
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "beyon-ai",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.get("/")
async def root():
    return {"message": "Beyon AI Service"}
