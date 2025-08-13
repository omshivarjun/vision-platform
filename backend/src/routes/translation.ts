import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const router = Router();

// Validation middleware
const validateTranslation = [
  body('text').notEmpty().trim(),
  body('source_lang').optional().isLength({ min: 2, max: 5 }),
  body('target_lang').isLength({ min: 2, max: 5 })
];

// Text translation endpoint
router.post('/text', validateTranslation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, source_lang = 'auto', target_lang } = req.body;

    // TODO: Implement actual translation logic
    // For now, return a mock response
    res.status(200).json({
      message: 'Translation successful',
      original_text: text,
      translated_text: `[${target_lang}] ${text}`,
      source_language: source_lang,
      target_language: target_lang,
      confidence: 0.95
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get supported languages endpoint
router.get('/languages', async (req: Request, res: Response) => {
  try {
    // TODO: Implement actual language list logic
    // For now, return a mock response
    res.status(200).json({
      languages: [
        { code: 'en', name: 'English', native_name: 'English' },
        { code: 'es', name: 'Spanish', native_name: 'Español' },
        { code: 'fr', name: 'French', native_name: 'Français' },
        { code: 'de', name: 'German', native_name: 'Deutsch' },
        { code: 'it', name: 'Italian', native_name: 'Italiano' },
        { code: 'pt', name: 'Portuguese', native_name: 'Português' },
        { code: 'ru', name: 'Russian', native_name: 'Русский' },
        { code: 'ja', name: 'Japanese', native_name: '日本語' },
        { code: 'ko', name: 'Korean', native_name: '한국어' },
        { code: 'zh', name: 'Chinese', native_name: '中文' }
      ]
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as translationRoutes };
