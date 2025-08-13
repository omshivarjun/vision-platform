import { TranslationService } from '../../services/ai/services/translation_service';

describe('Translation Service', () => {
  let translationService: TranslationService;

  beforeEach(() => {
    translationService = new TranslationService();
  });

  describe('Language Detection', () => {
    test('should detect English text', async () => {
      const text = 'Hello, how are you today?';
      const detectedLanguage = await translationService.detect_language(text);
      
      expect(detectedLanguage).toBe('en');
    });

    test('should detect Spanish text', async () => {
      const text = 'Hola, ¿cómo estás hoy?';
      const detectedLanguage = await translationService.detect_language(text);
      
      expect(detectedLanguage).toBe('es');
    });

    test('should handle empty text', async () => {
      const text = '';
      const detectedLanguage = await translationService.detect_language(text);
      
      expect(detectedLanguage).toBe('unknown');
    });
  });

  describe('Text Translation', () => {
    test('should translate English to Spanish', async () => {
      const result = await translationService.translate(
        'Hello world',
        'en',
        'es'
      );

      expect(result.originalText).toBe('Hello world');
      expect(result.sourceLanguage).toBe('en');
      expect(result.targetLanguage).toBe('es');
      expect(result.translatedText).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should handle auto-detection', async () => {
      const result = await translationService.translate(
        'Hello world',
        null, // Auto-detect
        'es'
      );

      expect(result.sourceLanguage).toBe('en');
      expect(result.targetLanguage).toBe('es');
      expect(result.translatedText).toBeTruthy();
    });

    test('should preserve context in translation', async () => {
      const result = await translationService.translate(
        'Bank',
        'en',
        'es',
        'financial institution'
      );

      expect(result.translatedText).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should handle unsupported language pairs', async () => {
      await expect(
        translationService.translate('Hello', 'xx', 'yy')
      ).rejects.toThrow();
    });
  });

  describe('Offline Translation', () => {
    test('should fallback to offline translation', async () => {
      // Mock network failure
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await translationService._offline_translate(
        'Hello world',
        'en',
        'es'
      );

      expect(result.translatedText).toBeTruthy();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Translation Quality', () => {
    test('should provide confidence scores', async () => {
      const result = await translationService.translate(
        'The weather is nice today',
        'en',
        'es'
      );

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    test('should provide alternative translations', async () => {
      const result = await translationService.translate(
        'Bank',
        'en',
        'es'
      );

      expect(result.alternatives).toBeInstanceOf(Array);
    });
  });
});