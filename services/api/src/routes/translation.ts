import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { getCache, setCache } from '../database/redis';
import { logger } from '../utils/logger';
import axios from 'axios';

const router = Router();

// AI service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * @swagger
 * /api/translation/text:
 *   post:
 *     summary: Translate text between languages
 *     tags: [Translation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - targetLanguage
 *             properties:
 *               text:
 *                 type: string
 *               sourceLanguage:
 *                 type: string
 *               targetLanguage:
 *                 type: string
 *               context:
 *                 type: string
 *               preserveFormatting:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Translation successful
 *       400:
 *         description: Validation error
 *       500:
 *         description: Translation service error
 */
router.post('/text', [
  authenticateToken,
  body('text').notEmpty().isLength({ max: 5000 }),
  body('targetLanguage').isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']),
  body('sourceLanguage').optional().isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']),
  body('context').optional().isLength({ max: 500 }),
  body('preserveFormatting').optional().isBoolean()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }

  const { text, sourceLanguage, targetLanguage, context, preserveFormatting = true } = req.body;
  const userId = req.user!._id;

  // Check cache first
  const cacheKey = `translation:${text}:${sourceLanguage || 'auto'}:${targetLanguage}`;
  const cachedResult = await getCache(cacheKey);
  
  if (cachedResult) {
    logger.info('Translation served from cache', { userId, cacheKey });
    return res.json({
      success: true,
      data: cachedResult,
      message: 'Translation retrieved from cache'
    });
  }

  try {
    // Call AI service for translation
    const response = await axios.post(`${AI_SERVICE_URL}/translate/text`, {
      text,
      sourceLanguage,
      targetLanguage,
      context,
      preserveFormatting
    }, {
      timeout: 30000 // 30 second timeout
    });

    const translationResult = response.data;

    // Cache the result for 1 hour
    await setCache(cacheKey, translationResult, 3600);

    logger.info('Text translation completed', { 
      userId, 
      sourceLanguage: sourceLanguage || 'auto', 
      targetLanguage,
      textLength: text.length 
    });

    res.json({
      success: true,
      data: translationResult,
      message: 'Translation completed successfully'
    });

  } catch (error: any) {
    logger.error('Translation service error:', { 
      error: error.message, 
      userId, 
      text: text.substring(0, 100) 
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Translation service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}));

/**
 * @swagger
 * /api/translation/speech-to-text:
 *   post:
 *     summary: Convert speech to text
 *     tags: [Translation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - audioData
 *             properties:
 *               audioData:
 *                 type: string
 *                 description: Base64 encoded audio data
 *               language:
 *                 type: string
 *               enablePunctuation:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Speech to text conversion successful
 *       400:
 *         description: Validation error
 *       500:
 *         description: Speech recognition service error
 */
router.post('/speech-to-text', [
  authenticateToken,
  body('audioData').notEmpty().isBase64(),
  body('language').optional().isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']),
  body('enablePunctuation').optional().isBoolean()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }

  const { audioData, language, enablePunctuation = true } = req.body;
  const userId = req.user!._id;

  try {
    // Call AI service for speech recognition
    const response = await axios.post(`${AI_SERVICE_URL}/speech/recognize`, {
      audioData,
      language,
      enablePunctuation
    }, {
      timeout: 60000 // 60 second timeout for audio processing
    });

    const recognitionResult = response.data;

    logger.info('Speech to text completed', { 
      userId, 
      language: language || 'auto',
      audioLength: Math.round(audioData.length * 0.75) // Approximate audio length
    });

    res.json({
      success: true,
      data: recognitionResult,
      message: 'Speech recognition completed successfully'
    });

  } catch (error: any) {
    logger.error('Speech recognition service error:', { 
      error: error.message, 
      userId 
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Speech recognition service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}));

/**
 * @swagger
 * /api/translation/text-to-speech:
 *   post:
 *     summary: Convert text to speech
 *     tags: [Translation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - language
 *             properties:
 *               text:
 *                 type: string
 *               language:
 *                 type: string
 *               voice:
 *                 type: string
 *               speed:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 2.0
 *     responses:
 *       200:
 *         description: Text to speech conversion successful
 *       400:
 *         description: Validation error
 *       500:
 *         description: Text to speech service error
 */
router.post('/text-to-speech', [
  authenticateToken,
  body('text').notEmpty().isLength({ max: 1000 }),
  body('language').isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']),
  body('voice').optional().isString(),
  body('speed').optional().isFloat({ min: 0.5, max: 2.0 })
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }

  const { text, language, voice, speed = 1.0 } = req.body;
  const userId = req.user!._id;

  try {
    // Call AI service for text to speech
    const response = await axios.post(`${AI_SERVICE_URL}/speech/synthesize`, {
      text,
      language,
      voice,
      speed
    }, {
      timeout: 60000 // 60 second timeout for audio generation
    });

    const synthesisResult = response.data;

    logger.info('Text to speech completed', { 
      userId, 
      language, 
      textLength: text.length,
      speed 
    });

    res.json({
      success: true,
      data: synthesisResult,
      message: 'Text to speech conversion completed successfully'
    });

  } catch (error: any) {
    logger.error('Text to speech service error:', { 
      error: error.message, 
      userId 
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Text to speech service temporarily unavailable',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
}));

/**
 * @swagger
 * /api/translation/conversation:
 *   post:
 *     summary: Start a real-time translation conversation
 *     tags: [Translation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceLanguage
 *               - targetLanguage
 *             properties:
 *               sourceLanguage:
 *                 type: string
 *               targetLanguage:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conversation session created
 *       400:
 *         description: Validation error
 */
router.post('/conversation', [
  authenticateToken,
  body('sourceLanguage').isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']),
  body('targetLanguage').isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']),
  body('sessionId').optional().isString()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }

  const { sourceLanguage, targetLanguage, sessionId } = req.body;
  const userId = req.user!._id;

  // Generate session ID if not provided
  const conversationSessionId = sessionId || `conv_${userId}_${Date.now()}`;

  logger.info('Translation conversation started', { 
    userId, 
    sourceLanguage, 
    targetLanguage, 
    sessionId: conversationSessionId 
  });

  res.json({
    success: true,
    data: {
      sessionId: conversationSessionId,
      sourceLanguage,
      targetLanguage,
      status: 'active'
    },
    message: 'Conversation session created successfully'
  });
}));

/**
 * @swagger
 * /api/translation/languages:
 *   get:
 *     summary: Get supported languages
 *     tags: [Translation]
 *     responses:
 *       200:
 *         description: List of supported languages
 */
router.get('/languages', asyncHandler(async (req, res) => {
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
  ];

  res.json({
    success: true,
    data: {
      languages,
      count: languages.length
    }
  });
}));

export default router;
