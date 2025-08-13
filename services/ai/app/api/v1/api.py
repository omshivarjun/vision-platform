"""
Main API router for AI Service v1
"""

from fastapi import APIRouter
from . import translation, ocr, speech, accessibility, health

# Create main API router
api_router = APIRouter()

# Include all feature routers
api_router.include_router(translation.router, prefix="/translation", tags=["Translation"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
api_router.include_router(speech.router, prefix="/speech", tags=["Speech"])
api_router.include_router(accessibility.router, prefix="/accessibility", tags=["Accessibility"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])
