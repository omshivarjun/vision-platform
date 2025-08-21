"""
Main API router for AI Service v1
"""

from fastapi import APIRouter
from . import translation, ocr, speech, accessibility, health, image_generation, sentiment, media

# Create main API router
api_router = APIRouter()

# Include all feature routers
api_router.include_router(translation.router, prefix="/translation", tags=["Translation"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
api_router.include_router(speech.router, prefix="/speech", tags=["Speech"])
api_router.include_router(accessibility.router, prefix="/accessibility", tags=["Accessibility"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(image_generation.router, prefix="/image-generation", tags=["Image Generation"])
api_router.include_router(sentiment.router, prefix="/sentiment", tags=["Sentiment Analysis"])
api_router.include_router(media.router, prefix="/media", tags=["Media Processing"])
