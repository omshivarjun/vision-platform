from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict

@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "services": {
            "translation": "available",
            "ocr": "available",
            "speech": "available",
            "accessibility": "available"
        }
    }

@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    return {"status": "ready"}

@router.get("/live")
async def liveness_check():
    """Liveness check endpoint"""
    return {"status": "alive"}
