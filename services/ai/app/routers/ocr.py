from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List
import logging
from services.ocr_service import OCRService

logger = logging.getLogger(__name__)
router = APIRouter()
ocr_service = OCRService()

class OCRRequest(BaseModel):
    language: str = "en"

class OCRResponse(BaseModel):
    text: str
    confidence: float
    blocks: list
    language: str

@router.post("/extract", response_model=OCRResponse)
async def extract_text(
    file: UploadFile = File(...),
    language: str = "en"
):
    """Extract text from uploaded image"""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        content = await file.read()
        result = await ocr_service.extract_text(content, language)
        
        return OCRResponse(**result)
        
    except Exception as e:
        logger.error(f"OCR extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-extract")
async def batch_extract_text(
    files: List[UploadFile] = File(...),
    language: str = "en"
):
    """Extract text from multiple images"""
    try:
        for file in files:
            if not file.content_type.startswith('image/'):
                raise HTTPException(status_code=400, detail="All files must be images")
        
        contents = []
        for file in files:
            content = await file.read()
            contents.append(content)
        
        results = await ocr_service.batch_process(contents, language)
        
        return {"results": results}
        
    except Exception as e:
        logger.error(f"Batch OCR extraction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported OCR languages"""
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
