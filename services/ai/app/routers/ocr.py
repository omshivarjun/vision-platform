from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import tempfile
import os
import uuid
from pathlib import Path
import asyncio

from ..services.ocr_service import ocr_service
from ..core.auth import get_current_user
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/ocr", tags=["OCR"])

@router.post("/extract")
async def extract_text(
    file: UploadFile = File(...),
    provider: Optional[str] = None,
    options: Optional[Dict[str, Any]] = None,
    current_user: Dict = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """
    Extract text from uploaded image or PDF file
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file size
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        max_size = int(os.getenv('MAX_FILE_SIZE', 52428800))  # 50MB
        if file_size > max_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large: {file_size} bytes. Maximum: {max_size} bytes"
            )
        
        # Check file format
        file_extension = Path(file.filename).suffix.lower().lstrip('.')
        supported_formats = os.getenv('SUPPORTED_FORMATS', 'pdf,jpg,jpeg,png,tiff').split(',')
        
        if file_extension not in supported_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format: {file_extension}. Supported: {', '.join(supported_formats)}"
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        
        try:
            logger.info(f"Processing OCR request", {
                "user_id": current_user.get("id"),
                "filename": file.filename,
                "file_size": file_size,
                "provider": provider or "default"
            })
            
            # Process OCR
            result = await ocr_service.extract_text(temp_path, provider, options)
            
            # Add user information
            result["user_id"] = current_user.get("id")
            result["filename"] = file.filename
            
            # Store result in database (background task)
            if background_tasks:
                background_tasks.add_task(store_ocr_result, result)
            
            logger.info(f"OCR processing completed", {
                "user_id": current_user.get("id"),
                "filename": file.filename,
                "text_length": len(result.get("text", "")),
                "provider": result.get("provider"),
                "processing_time": result.get("processing_time", 0)
            })
            
            return JSONResponse(content={
                "success": True,
                "data": result
            })
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_path)
            except Exception as e:
                logger.warning(f"Failed to clean up temporary file: {e}")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

@router.post("/batch")
async def batch_extract_text(
    files: list[UploadFile] = File(...),
    provider: Optional[str] = None,
    options: Optional[Dict[str, Any]] = None,
    current_user: Dict = Depends(get_current_user)
):
    """
    Extract text from multiple files in batch
    """
    try:
        # Validate batch size
        if len(files) > 10:
            raise HTTPException(
                status_code=400,
                detail="Batch too large. Maximum 10 files per request"
            )
        
        results = []
        temp_files = []
        
        try:
            for i, file in enumerate(files):
                # Validate file
                if not file.filename:
                    continue
                
                # Check file size
                content = await file.read()
                file_size = len(content)
                
                max_size = int(os.getenv('MAX_FILE_SIZE', 52428800))
                if file_size > max_size:
                    results.append({
                        "filename": file.filename,
                        "error": f"File too large: {file_size} bytes"
                    })
                    continue
                
                # Check file format
                file_extension = Path(file.filename).suffix.lower().lstrip('.')
                supported_formats = os.getenv('SUPPORTED_FORMATS', 'pdf,jpg,jpeg,png,tiff').split(',')
                
                if file_extension not in supported_formats:
                    results.append({
                        "filename": file.filename,
                        "error": f"Unsupported format: {file_extension}"
                    })
                    continue
                
                # Create temporary file
                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
                    temp_file.write(content)
                    temp_path = temp_file.name
                    temp_files.append(temp_path)
                
                try:
                    # Process OCR
                    result = await ocr_service.extract_text(temp_path, provider, options)
                    result["user_id"] = current_user.get("id")
                    result["filename"] = file.filename
                    results.append(result)
                    
                except Exception as e:
                    results.append({
                        "filename": file.filename,
                        "error": str(e)
                    })
                    
        finally:
            # Clean up temporary files
            for temp_path in temp_files:
                try:
                    os.unlink(temp_path)
                except Exception as e:
                    logger.warning(f"Failed to clean up temporary file: {e}")
        
        logger.info(f"Batch OCR processing completed", {
            "user_id": current_user.get("id"),
            "total_files": len(files),
            "successful": len([r for r in results if "error" not in r]),
            "failed": len([r for r in results if "error" in r])
        })
        
        return JSONResponse(content={
            "success": True,
            "data": {
                "results": results,
                "summary": {
                    "total_files": len(files),
                    "successful": len([r for r in results if "error" not in r]),
                    "failed": len([r for r in results if "error" in r])
                }
            }
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch OCR processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch OCR processing failed: {str(e)}")

@router.get("/providers")
async def get_ocr_providers():
    """
    Get available OCR providers
    """
    try:
        providers = ocr_service.get_available_providers()
        
        return JSONResponse(content={
            "success": True,
            "data": providers
        })
        
    except Exception as e:
        logger.error(f"Failed to get OCR providers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get OCR providers")

@router.get("/formats")
async def get_supported_formats():
    """
    Get supported file formats
    """
    try:
        formats = ocr_service.get_supported_formats()
        
        return JSONResponse(content={
            "success": True,
            "data": formats
        })
        
    except Exception as e:
        logger.error(f"Failed to get supported formats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get supported formats")

@router.get("/health")
async def get_ocr_health():
    """
    Get OCR service health status
    """
    try:
        health = ocr_service.get_health_status()
        
        return JSONResponse(content={
            "success": True,
            "data": health
        })
        
    except Exception as e:
        logger.error(f"Failed to get OCR health: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get OCR health")

async def store_ocr_result(result: Dict[str, Any]):
    """
    Store OCR result in database (background task)
    """
    try:
        # TODO: Implement database storage
        # For now, just log the result
        logger.info("OCR result stored", {
            "user_id": result.get("user_id"),
            "filename": result.get("filename"),
            "text_length": len(result.get("text", "")),
            "provider": result.get("provider")
        })
        
    except Exception as e:
        logger.error(f"Failed to store OCR result: {str(e)}")
        # Don't raise error as this is a background task
