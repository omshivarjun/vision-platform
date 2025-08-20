"""
OCR service for AI Service
"""

import asyncio
import logging
import io
from typing import List, Dict, Any, Optional, Union
import time
from PIL import Image
import numpy as np
from pathlib import Path
import tempfile
import os

# OCR Libraries
try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

try:
    import pdf2image
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

# Cloud OCR providers
try:
    from google.cloud import vision
    GOOGLE_VISION_AVAILABLE = True
except ImportError:
    GOOGLE_VISION_AVAILABLE = False

try:
    import azure.cognitiveservices.vision.computervision as ComputerVision
    from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
    AZURE_VISION_AVAILABLE = True
except ImportError:
    AZURE_VISION_AVAILABLE = False

logger = logging.getLogger(__name__)

class OCRService:
    """OCR Service for text extraction from images and PDFs"""
    
    def __init__(self):
        self.default_provider = os.getenv('DEFAULT_OCR_PROVIDER', 'tesseract')
        self.cache_ttl = int(os.getenv('OCR_CACHE_TTL', 7200))
        self.max_file_size = int(os.getenv('MAX_FILE_SIZE', 52428800))  # 50MB
        self.supported_formats = os.getenv('SUPPORTED_FORMATS', 'pdf,jpg,jpeg,png,tiff').split(',')
        
        # Initialize providers
        self.providers = {
            'tesseract': self._tesseract_ocr if TESSERACT_AVAILABLE else None,
            'google': self._google_vision_ocr if GOOGLE_VISION_AVAILABLE else None,
            'azure': self._azure_vision_ocr if AZURE_VISION_AVAILABLE else None
        }
        
        # Check provider availability
        self.available_providers = [name for name, func in self.providers.items() if func is not None]
        
        if not self.available_providers:
            raise RuntimeError("No OCR providers available. Please install required dependencies.")
        
        logger.info(f"OCR Service initialized with providers: {self.available_providers}")
    
    async def extract_text(
        self, 
        file_path: Union[str, Path], 
        provider: Optional[str] = None,
        options: Optional[Dict] = None
    ) -> Dict:
        """
        Extract text from image or PDF file
        
        Args:
            file_path: Path to the file
            provider: OCR provider to use (tesseract, google, azure)
            options: Additional options for the provider
            
        Returns:
            Dictionary containing extracted text and metadata
        """
        try:
            file_path = Path(file_path)
            
            # Validate file
            if not file_path.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Check file size
            file_size = file_path.stat().st_size
            if file_size > self.max_file_size:
                raise ValueError(f"File too large: {file_size} bytes. Maximum: {self.max_file_size} bytes")
            
            # Check file format
            file_extension = file_path.suffix.lower().lstrip('.')
            if file_extension not in self.supported_formats:
                raise ValueError(f"Unsupported file format: {file_extension}")
            
            # Determine provider
            selected_provider = provider or self.default_provider
            if selected_provider not in self.available_providers:
                logger.warning(f"Provider {selected_provider} not available, using {self.available_providers[0]}")
                selected_provider = self.available_providers[0]
            
            logger.info(f"Processing file {file_path} with {selected_provider} provider")
            
            # Process file based on type
            if file_extension == 'pdf':
                result = await self._process_pdf(file_path, selected_provider, options)
            else:
                result = await self._process_image(file_path, selected_provider, options)
            
            # Add metadata
            result.update({
                'file_path': str(file_path),
                'file_size': file_size,
                'file_format': file_extension,
                'provider': selected_provider,
                'processing_time': result.get('processing_time', 0)
            })
            
            return result
            
        except Exception as e:
            logger.error(f"OCR processing failed: {str(e)}")
            raise
    
    async def _process_pdf(self, file_path: Path, provider: str, options: Optional[Dict]) -> Dict:
        """Process PDF file and extract text"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Convert PDF to images
            images = await self._pdf_to_images(file_path)
            
            all_text = []
            all_blocks = []
            page_results = []
            
            for page_num, image in enumerate(images):
                logger.info(f"Processing PDF page {page_num + 1}")
                
                # Save image to temporary file
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                    image.save(temp_file.name, 'PNG')
                    temp_path = temp_file.name
                
                try:
                    # Process image
                    page_result = await self._process_image(temp_path, provider, options)
                    
                    # Add page information
                    page_result['page_number'] = page_num + 1
                    page_results.append(page_result)
                    
                    all_text.append(page_result.get('text', ''))
                    all_blocks.extend(page_result.get('blocks', []))
                    
                finally:
                    # Clean up temporary file
                    os.unlink(temp_path)
            
            processing_time = asyncio.get_event_loop().time() - start_time
            
            return {
                'text': '\n\n--- Page Break ---\n\n'.join(all_text),
                'blocks': all_blocks,
                'pages': page_results,
                'total_pages': len(images),
                'processing_time': processing_time
            }
            
        except Exception as e:
            logger.error(f"PDF processing failed: {str(e)}")
            raise
    
    async def _pdf_to_images(self, file_path: Path) -> List[Image.Image]:
        """Convert PDF to list of PIL Images"""
        try:
            if PDF2IMAGE_AVAILABLE:
                # Use pdf2image (better quality)
                images = pdf2image.convert_from_path(file_path, dpi=300)
                return images
            elif PYMUPDF_AVAILABLE:
                # Use PyMuPDF as fallback
                doc = fitz.open(file_path)
                images = []
                for page in doc:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
                    img_data = pix.tobytes("png")
                    img = Image.open(io.BytesIO(img_data))
                    images.append(img)
                doc.close()
                return images
            else:
                raise RuntimeError("No PDF processing library available")
        except Exception as e:
            logger.error(f"PDF to image conversion failed: {str(e)}")
            raise
    
    async def _process_image(self, file_path: Union[str, Path], provider: str, options: Optional[Dict]) -> Dict:
        """Process image file and extract text"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Get the OCR function for the provider
            ocr_func = self.providers[provider]
            if not ocr_func:
                raise ValueError(f"Provider {provider} not available")
            
            # Run OCR
            if asyncio.iscoroutinefunction(ocr_func):
                result = await ocr_func(file_path, options)
            else:
                # Run synchronous function in thread pool
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, ocr_func, file_path, options)
            
            processing_time = asyncio.get_event_loop().time() - start_time
            result['processing_time'] = processing_time
            
            return result
            
        except Exception as e:
            logger.error(f"Image processing failed: {str(e)}")
            raise
    
    def _tesseract_ocr(self, file_path: Union[str, Path], options: Optional[Dict]) -> Dict:
        """Extract text using Tesseract OCR"""
        try:
            # Configure Tesseract
            config = '--oem 3 --psm 6'  # Default OCR Engine Mode and Page Segmentation Mode
            if options and 'tesseract_config' in options:
                config = options['tesseract_config']
            
            # Extract text
            text = pytesseract.image_to_string(file_path, config=config)
            
            # Get bounding boxes for text blocks
            data = pytesseract.image_to_data(file_path, config=config, output_type=pytesseract.Output.DICT)
            
            blocks = []
            for i in range(len(data['text'])):
                if data['conf'][i] > 0:  # Filter out low confidence results
                    block = {
                        'text': data['text'][i],
                        'confidence': data['conf'][i] / 100.0,
                        'bbox': {
                            'x': data['left'][i],
                            'y': data['top'][i],
                            'width': data['width'][i],
                            'height': data['height'][i]
                        },
                        'block_num': data['block_num'][i],
                        'line_num': data['line_num'][i]
                    }
                    blocks.append(block)
            
            return {
                'text': text.strip(),
                'blocks': blocks,
                'confidence': sum(block['confidence'] for block in blocks) / len(blocks) if blocks else 0
            }
            
        except Exception as e:
            logger.error(f"Tesseract OCR failed: {str(e)}")
            raise
    
    def _google_vision_ocr(self, file_path: Union[str, Path], options: Optional[Dict]) -> Dict:
        """Extract text using Google Cloud Vision API"""
        try:
            # Initialize client
            client = vision.ImageAnnotatorClient()
            
            # Read image file
            with open(file_path, 'rb') as image_file:
                content = image_file.read()
            
            image = vision.Image(content=content)
            
            # Perform text detection
            response = client.text_detection(image=image)
            texts = response.text_annotations
            
            if not texts:
                return {'text': '', 'blocks': [], 'confidence': 0}
            
            # Full text is the first element
            full_text = texts[0].description
            
            # Extract individual text blocks
            blocks = []
            for text in texts[1:]:  # Skip first element (full text)
                block = {
                    'text': text.description,
                    'confidence': 0.9,  # Google doesn't provide confidence scores
                    'bbox': {
                        'x': text.bounding_poly.vertices[0].x,
                        'y': text.bounding_poly.vertices[0].y,
                        'width': text.bounding_poly.vertices[2].x - text.bounding_poly.vertices[0].x,
                        'height': text.bounding_poly.vertices[2].y - text.bounding_poly.vertices[0].y
                    }
                }
                blocks.append(block)
            
            return {
                'text': full_text,
                'blocks': blocks,
                'confidence': 0.9
            }
            
        except Exception as e:
            logger.error(f"Google Vision OCR failed: {str(e)}")
            raise
    
    def _azure_vision_ocr(self, file_path: Union[str, Path], options: Optional[Dict]) -> Dict:
        """Extract text using Azure Computer Vision API"""
        try:
            # Initialize client
            endpoint = os.getenv('AZURE_VISION_ENDPOINT')
            key = os.getenv('AZURE_VISION_KEY')
            
            if not endpoint or not key:
                raise ValueError("Azure Vision credentials not configured")
            
            client = ComputerVision.ComputerVisionClient(endpoint, ComputerVision.ApiKeyCredentials(key))
            
            # Read image file
            with open(file_path, 'rb') as image_file:
                image_data = image_file.read()
            
            # Perform OCR
            result = client.recognize_printed_text_in_stream(image_data)
            
            # Extract text and blocks
            full_text = ""
            blocks = []
            
            for region in result.regions:
                for line in region.lines:
                    line_text = ""
                    for word in line.words:
                        word_text = word.text
                        line_text += word_text + " "
                        
                        # Add word block
                        bbox = word.bounding_box
                        block = {
                            'text': word_text,
                            'confidence': 0.9,  # Azure doesn't provide confidence scores
                            'bbox': {
                                'x': bbox[0],
                                'y': bbox[1],
                                'width': bbox[2] - bbox[0],
                                'height': bbox[3] - bbox[1]
                            }
                        }
                        blocks.append(block)
                    
                    full_text += line_text.strip() + "\n"
            
            return {
                'text': full_text.strip(),
                'blocks': blocks,
                'confidence': 0.9
            }
            
        except Exception as e:
            logger.error(f"Azure Vision OCR failed: {str(e)}")
            raise
    
    def get_available_providers(self) -> List[Dict]:
        """Get list of available OCR providers"""
        providers = []
        
        if TESSERACT_AVAILABLE:
            providers.append({
                'id': 'tesseract',
                'name': 'Tesseract OCR',
                'description': 'Open-source OCR engine',
                'premium': False,
                'features': ['Text extraction', 'Bounding boxes', 'Confidence scores']
            })
        
        if GOOGLE_VISION_AVAILABLE:
            providers.append({
                'id': 'google',
                'name': 'Google Cloud Vision',
                'description': 'Cloud-based OCR with high accuracy',
                'premium': True,
                'features': ['High accuracy', 'Layout analysis', 'Multiple languages']
            })
        
        if AZURE_VISION_AVAILABLE:
            providers.append({
                'id': 'azure',
                'name': 'Azure Computer Vision',
                'description': 'Microsoft cloud OCR service',
                'premium': True,
                'features': ['High accuracy', 'Layout analysis', 'Handwriting recognition']
            })
        
        return providers
    
    def get_supported_formats(self) -> List[str]:
        """Get list of supported file formats"""
        return self.supported_formats.copy()
    
    def get_health_status(self) -> Dict:
        """Get health status of OCR service"""
        return {
            'status': 'healthy',
            'available_providers': len(self.available_providers),
            'default_provider': self.default_provider,
            'supported_formats': self.supported_formats,
            'max_file_size': self.max_file_size
        }

# Global OCR service instance
ocr_service = OCRService()