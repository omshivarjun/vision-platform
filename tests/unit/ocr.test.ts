import { OCRService } from '../../services/ai/services/ocr_service';

describe('OCR Service', () => {
  let ocrService: OCRService;

  beforeEach(() => {
    ocrService = new OCRService();
  });

  describe('Text Extraction', () => {
    test('should extract text from image', async () => {
      const mockImageData = Buffer.from('fake-image-data');
      
      const result = await ocrService.extract_text(mockImageData, 'en');

      expect(result.text).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.language).toBe('en');
      expect(result.blocks).toBeInstanceOf(Array);
    });

    test('should handle different languages', async () => {
      const mockImageData = Buffer.from('fake-image-data');
      
      const result = await ocrService.extract_text(mockImageData, 'es');

      expect(result.language).toBe('es');
      expect(result.text).toBeTruthy();
    });

    test('should provide bounding boxes', async () => {
      const mockImageData = Buffer.from('fake-image-data');
      
      const result = await ocrService.extract_text(mockImageData, 'en');

      expect(result.blocks).toBeInstanceOf(Array);
      result.blocks.forEach(block => {
        expect(block.text).toBeTruthy();
        expect(block.confidence).toBeGreaterThan(0);
        expect(block.bbox).toBeInstanceOf(Array);
        expect(block.bbox).toHaveLength(4);
      });
    });
  });

  describe('Batch Processing', () => {
    test('should process multiple images', async () => {
      const mockImages = [
        Buffer.from('fake-image-1'),
        Buffer.from('fake-image-2'),
        Buffer.from('fake-image-3')
      ];

      const results = await ocrService.batch_process(mockImages, 'en');

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.text).toBeTruthy();
        expect(result.confidence).toBeGreaterThan(0);
      });
    });

    test('should handle empty batch', async () => {
      const results = await ocrService.batch_process([], 'en');
      expect(results).toHaveLength(0);
    });
  });

  describe('Language Support', () => {
    test('should update supported languages', () => {
      const newLanguages = ['en', 'es', 'fr', 'de'];
      
      expect(() => {
        ocrService.update_languages(newLanguages);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid image data', async () => {
      const invalidImageData = Buffer.from('invalid-data');

      await expect(
        ocrService.extract_text(invalidImageData, 'en')
      ).rejects.toThrow();
    });

    test('should handle unsupported language', async () => {
      const mockImageData = Buffer.from('fake-image-data');

      await expect(
        ocrService.extract_text(mockImageData, 'unsupported-lang')
      ).rejects.toThrow();
    });
  });
});