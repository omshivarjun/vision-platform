from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import logging
from services.translation_service import TranslationService

logger = logging.getLogger(__name__)
router = APIRouter()
translation_service = TranslationService()

class TranslationRequest(BaseModel):
    text: str
    source_lang: Optional[str] = None
    target_lang: str = "en"
    context: Optional[str] = None

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence: float
    alternatives: list

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """Translate text from source language to target language"""
    try:
        result = await translation_service.translate(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
            context=request.context
        )
        
        return TranslationResponse(
            original_text=result["originalText"],
            translated_text=result["translatedText"],
            source_language=result["sourceLanguage"],
            target_language=result["targetLanguage"],
            confidence=result["confidence"],
            alternatives=result["alternatives"]
        )
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages"""
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "es", "name": "Spanish"},
            {"code": "fr", "name": "French"},
            {"code": "de", "name": "German"},
            {"code": "it", "name": "Italian"},
            {"code": "pt", "name": "Portuguese"},
            {"code": "ru", "name": "Russian"},
            {"code": "ja", "name": "Japanese"},
            {"code": "ko", "name": "Korean"},
            {"code": "zh", "name": "Chinese"}
        ]
    }

@router.post("/detect-language")
async def detect_language(text: str):
    """Detect the language of the given text"""
    try:
        detected_lang = await translation_service.detect_language(text)
        return {"language": detected_lang}
    except Exception as e:
        logger.error(f"Language detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
