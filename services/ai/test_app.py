#!/usr/bin/env python3
"""
Test script to verify the AI service is working correctly
"""

import asyncio
import sys
import os

# Add the services directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.translation_service import TranslationService
from services.ocr_service import OCRService

async def test_translation():
    """Test the translation service"""
    print("Testing Translation Service...")
    service = TranslationService()
    
    try:
        # Test language detection
        text = "Hello, how are you?"
        detected = await service.detect_language(text)
        print(f"Detected language: {detected}")
        
        # Test translation
        result = await service.translate(text, target_lang="es")
        print(f"Translation result: {result}")
        
        return True
    except Exception as e:
        print(f"Translation test failed: {e}")
        return False

async def test_ocr():
    """Test the OCR service"""
    print("Testing OCR Service...")
    service = OCRService()
    
    try:
        # Create a simple test image (white background)
        from PIL import Image
        import io
        
        # Create a simple test image
        img = Image.new('RGB', (100, 30), color='white')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        # Test OCR
        result = await service.extract_text(img_bytes.getvalue())
        print(f"OCR result: {result}")
        
        return True
    except Exception as e:
        print(f"OCR test failed: {e}")
        return False

async def main():
    """Run all tests"""
    print("Starting AI Service Tests...")
    
    # Test translation
    translation_ok = await test_translation()
    
    # Test OCR
    ocr_ok = await test_ocr()
    
    if translation_ok and ocr_ok:
        print("✅ All tests passed!")
        return True
    else:
        print("❌ Some tests failed")
        return False

if __name__ == "__main__":
    asyncio.run(main())
