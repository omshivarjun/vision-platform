
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
import shutil
import os
from ...services.ffmpeg_service import extract_audio_from_media
from ...services.asr_service import transcribe_audio

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '../../../uploads/media')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post('/upload')
def upload_media(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)
        audio_path = None
        transcript = None
        try:
            audio_path = extract_audio_from_media(file_path, UPLOAD_DIR)
            transcript = transcribe_audio(audio_path)
        except Exception as processing_error:
            print(f'Media processing error: {processing_error}')
        return {
            'mediaId': str(int(os.path.getmtime(file_path))),
            'status': 'processed',
            'fileName': file.filename,
            'fileSize': os.path.getsize(file_path),
            'fileType': file.content_type,
            'audioPath': os.path.basename(audio_path) if audio_path else None,
            'transcript': transcript or None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Media upload failed: {e}')
