import logging
import io
from typing import List, Dict, Any
import easyocr
from PIL import Image
import numpy as np

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        self.reader = easyocr.Reader(['en'])  # Initialize with English
    
    async def extract_text(self, image_file: bytes, language: str = 'en') -> Dict[str, Any]:
        """Extract text from image using OCR"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_file))
            
            # Convert PIL Image to numpy array
            image_array = np.array(image)
            
            # Perform OCR
            results = self.reader.readtext(image_array)
            
            # Process results
            text_blocks = []
            full_text = ""
            
            for bbox, text, confidence in results:
                text_blocks.append({
                    "text": text,
                    "confidence": float(confidence),
                    "bbox": bbox
                })
                full_text += text + " "
            
            return {
                "text": full_text.strip(),
                "confidence": sum(block["confidence"] for block in text_blocks) / len(text_blocks) if text_blocks else 0,
                "blocks": text_blocks,
                "language": language
            }
            
        except Exception as e:
            logger.error(f"OCR extraction error: {e}")
            raise
    
    async def batch_process(self, image_files: List[bytes], language: str = 'en') -> List[Dict[str, Any]]:
        """Process multiple images in batch"""
        results = []
        for image_file in image_files:
            result = await self.extract_text(image_file, language)
            results.append(result)
        return results
    
    def update_languages(self, languages: List[str]) -> None:
        """Update OCR reader with new languages"""
        self.reader = easyocr.Reader(languages)
