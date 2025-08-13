import pytest
from unittest.mock import patch, MagicMock
from services.ocr_service import OCRService

@pytest.fixture
def ocr_service():
    return OCRService()

@pytest.mark.asyncio
async def test_extract_text_success(ocr_service):
    """Test successful OCR text extraction"""
    mock_result = [[
        [[100, 100], [200, 100], [200, 150], [100, 150]], 
        ("Hello World", 0.95)
    ]]
    
    with patch.object(ocr_service.ocr, 'ocr', return_value=[mock_result]):
        mock_file = MagicMock()
        mock_file.read = MagicMock(return_value=b"fake_image_data")
        
        result = await ocr_service.extract_text(mock_file)
        
        assert result["text"] == "Hello World"
        assert result["confidence"] == 0.95
        assert len(result["blocks"]) == 1

@pytest.mark.asyncio
async def test_batch_process(ocr_service):
    """Test batch OCR processing"""
    mock_result = [[
        [[100, 100], [200, 100], [200, 150], [100, 150]], 
        ("Test", 0.9)
    ]]
    
    with patch.object(ocr_service.ocr, 'ocr', return_value=[mock_result]):
        mock_files = [MagicMock(), MagicMock()]
        for mock_file in mock_files:
            mock_file.read = MagicMock(return_value=b"fake_image_data")
        
        results = await ocr_service.batch_process(mock_files)
        
        assert len(results) == 2
        assert all(r["text"] == "Test" for r in results)
