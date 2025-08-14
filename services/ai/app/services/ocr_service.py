"""
OCR service for AI Service
"""

import asyncio
import logging
import io
from typing import List, Dict, Any, Optional
import time
from PIL import Image
import numpy as np

# Optional imports for different OCR providers
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

try:
    from paddleocr import PaddleOCR
    PADDLEOCR_AVAILABLE = True
except ImportError:
    PADDLEOCR_AVAILABLE = False

logger = logging.getLogger(__name__)

class OCRService:
    """OCR service with multiple provider support"""
    
    def __init__(self):
        self.easyocr_reader = None
        self.paddle_ocr = None
        self._initialize_ocr_engines()
    
    def _initialize_ocr_engines(self):
        """Initialize OCR engines"""
        try:
            # Initialize EasyOCR
            if EASYOCR_AVAILABLE:
                self.easyocr_reader = easyocr.Reader(['en', 'es', 'fr', 'de', 'it', 'pt'])
                logger.info("EasyOCR initialized")
            
            # Initialize PaddleOCR
            if PADDLEOCR_AVAILABLE:
                self.paddle_ocr = PaddleOCR(use_angle_cls=True, lang='en')
                logger.info("PaddleOCR initialized")
                
        except Exception as e:
            logger.error(f"Failed to initialize OCR engines: {e}")
    
    async def extract_text(
        self,
        image_data: bytes,
        language: str = "en",
        model: str = "easyocr"
    ) -> Dict[str, Any]:
        """Extract text from image using OCR"""
        start_time = time.time()
        
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to numpy array for OCR processing
            image_array = np.array(image)
            
            # Choose OCR engine
            if model == "paddle" and self.paddle_ocr:
                result = await self._paddle_ocr_extract(image_array, language)
            elif model == "tesseract" and TESSERACT_AVAILABLE:
                result = await self._tesseract_extract(image_array, language)
            elif self.easyocr_reader:
                result = await self._easyocr_extract(image_array, language)
            else:
                # Fallback mock OCR
                result = await self._mock_ocr_extract(image_array, language)
            
            result["processing_time"] = (time.time() - start_time) * 1000
            
            logger.info(f"OCR extraction completed", {
                "language": language,
                "model": model,
                "text_length": len(result.get("text", "")),
                "confidence": result.get("confidence"),
                "processing_time": result["processing_time"]
            })
            
            return result
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            raise
    
    async def _easyocr_extract(self, image_array: np.ndarray, language: str) -> Dict[str, Any]:
        """Extract text using EasyOCR"""
        try:
            results = self.easyocr_reader.readtext(image_array)
            
            text_blocks = []
            full_text = ""
            total_confidence = 0
            
            for bbox, text, confidence in results:
                text_blocks.append({
                    "text": text,
                    "confidence": float(confidence),
                    "bbox": bbox
                })
                full_text += text + " "
                total_confidence += confidence
            
            avg_confidence = total_confidence / len(results) if results else 0
            
            return {
                "text": full_text.strip(),
                "confidence": float(avg_confidence),
                "blocks": text_blocks,
                "language": language,
                "model": "easyocr"
            }
            
        except Exception as e:
            logger.error(f"EasyOCR extraction failed: {e}")
            raise
    
    async def _paddle_ocr_extract(self, image_array: np.ndarray, language: str) -> Dict[str, Any]:
        """Extract text using PaddleOCR"""
        try:
            results = self.paddle_ocr.ocr(image_array, cls=True)
            
            text_blocks = []
            full_text = ""
            total_confidence = 0
            count = 0
            
            for line in results:
                if line:
                    for word_info in line:
                        bbox, (text, confidence) = word_info
                        text_blocks.append({
                            "text": text,
                            "confidence": float(confidence),
                            "bbox": bbox
                        })
                        full_text += text + " "
                        total_confidence += confidence
                        count += 1
            
            avg_confidence = total_confidence / count if count > 0 else 0
            
            return {
                "text": full_text.strip(),
                "confidence": float(avg_confidence),
                "blocks": text_blocks,
                "language": language,
                "model": "paddleocr"
            }
            
        except Exception as e:
            logger.error(f"PaddleOCR extraction failed: {e}")
            raise
    
    async def _tesseract_extract(self, image_array: np.ndarray, language: str) -> Dict[str, Any]:
        """Extract text using Tesseract"""
        try:
            # Convert numpy array to PIL Image
            image = Image.fromarray(image_array)
            
            # Extract text
            text = pytesseract.image_to_string(image, lang=language)
            
            # Get confidence data
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            # Create text blocks
            text_blocks = []
            for i, word in enumerate(data['text']):
                if word.strip() and int(data['conf'][i]) > 0:
                    text_blocks.append({
                        "text": word,
                        "confidence": int(data['conf'][i]) / 100.0,
                        "bbox": [
                            data['left'][i],
                            data['top'][i],
                            data['left'][i] + data['width'][i],
                            data['top'][i] + data['height'][i]
                        ]
                    })
            
            return {
                "text": text.strip(),
                "confidence": avg_confidence / 100.0,
                "blocks": text_blocks,
                "language": language,
                "model": "tesseract"
            }
            
        except Exception as e:
            logger.error(f"Tesseract extraction failed: {e}")
            raise
    
    async def _mock_ocr_extract(self, image_array: np.ndarray, language: str) -> Dict[str, Any]:
        """Mock OCR extraction for development"""
        await asyncio.sleep(0.5)  # Simulate processing time
        
        # Generate mock text based on image characteristics
        height, width = image_array.shape[:2]
        
        if width > height:
            mock_text = "This is a sample document with horizontal text layout."
        else:
            mock_text = "Sample vertical text content extracted from image."
        
        return {
            "text": mock_text,
            "confidence": 0.75,
            "blocks": [
                {
                    "text": mock_text,
                    "confidence": 0.75,
                    "bbox": [50, 50, width-50, height-50]
                }
            ],
            "language": language,
            "model": "mock-ocr"
        }
    
    async def batch_process(
        self,
        image_files: List[bytes],
        language: str = "en",
        model: str = "easyocr"
    ) -> List[Dict[str, Any]]:
        """Process multiple images in batch"""
        results = []
        
        for image_data in image_files:
            try:
                result = await self.extract_text(image_data, language, model)
                results.append(result)
            except Exception as e:
                logger.error(f"Batch OCR processing failed for image: {e}")
                results.append({
                    "text": "",
                    "confidence": 0.0,
                    "blocks": [],
                    "language": language,
                    "model": model,
                    "error": str(e)
                })
        
        return results
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported OCR languages"""
        return [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "es", "name": "Spanish", "native_name": "Español"},
            {"code": "fr", "name": "French", "native_name": "Français"},
            {"code": "de", "name": "German", "native_name": "Deutsch"},
            {"code": "it", "name": "Italian", "native_name": "Italiano"},
            {"code": "pt", "name": "Portuguese", "native_name": "Português"},
            {"code": "ru", "name": "Russian", "native_name": "Русский"},
            {"code": "ja", "name": "Japanese", "native_name": "日本語"},
            {"code": "ko", "name": "Korean", "native_name": "한국어"},
            {"code": "zh", "name": "Chinese", "native_name": "中文"},
            {"code": "ar", "name": "Arabic", "native_name": "العربية"},
            {"code": "hi", "name": "Hindi", "native_name": "हिन्दी"}
        ]

# Global OCR service instance
ocr_service = OCRService()