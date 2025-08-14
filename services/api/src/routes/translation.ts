import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { Translation } from '../models/Translation';
import { User } from '../models/User';
import axios from 'axios';

const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * @swagger
 * /api/translation/text:
 *   post:
 *     summary: Translate text
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
 *                 maxLength: 5000
 *               sourceLanguage:
 *                 type: string
 *                 description: Source language code (auto-detect if not provided)
 *               targetLanguage:
 *                 type: string
 *                 description: Target language code
 *               quality:
 *                 type: string
 *                 enum: [fast, balanced, high]
 *                 default: balanced
 *               context:
 *                 type: string
 *                 description: Context for better translation
 */
router.post(
  '/text',
  optionalAuth,
  [
    body('text').isString().trim().isLength({ min: 1, max: 5000 }),
    body('sourceLanguage').optional().isString().isLength({ min: 2, max: 5 }),
    body('targetLanguage').isString().isLength({ min: 2, max: 5 }),
    body('quality').optional().isIn(['fast', 'balanced', 'high']),
    body('context').optional().isString().trim().isLength({ max: 200 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    try {
      const { text, sourceLanguage, targetLanguage, quality = 'balanced', context } = req.body;
      const startTime = Date.now();

      // Call AI service for translation
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/translation/translate`, {
        text,
        source_lang: sourceLanguage || 'auto',
        target_lang: targetLanguage,
        model: 'marian',
        quality
      });

      const processingTime = Date.now() - startTime;
      const translationResult = aiResponse.data;

      // Save translation to database if user is authenticated
      if (req.user) {
        const translation = new Translation({
          userId: req.user.id,
          sourceText: text,
          translatedText: translationResult.translated_text,
          sourceLanguage: translationResult.source_lang,
          targetLanguage: translationResult.target_lang,
          model: translationResult.model_used,
          confidence: translationResult.confidence,
          processingTime,
          quality,
          context,
          metadata: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            sessionId: req.sessionID,
          }
        });

        await translation.save();

        // Update user's translation history
        await User.findByIdAndUpdate(req.user.id, {
          $push: {
            'preferences.translationHistory': {
              $each: [{
                sourceText: text,
                translatedText: translationResult.translated_text,
                sourceLang: translationResult.source_lang,
                targetLang: translationResult.target_lang,
                timestamp: new Date(),
                model: translationResult.model_used,
                confidence: translationResult.confidence
              }],
              $slice: -100 // Keep only last 100 translations
            }
          }
        });
      }

      logger.info('Translation completed', {
        userId: req.user?.id,
        sourceLanguage: translationResult.source_lang,
        targetLanguage: translationResult.target_lang,
        textLength: text.length,
        processingTime,
        confidence: translationResult.confidence
      });

      res.json({
        success: true,
        data: {
          id: Date.now().toString(),
          sourceText: text,
          translatedText: translationResult.translated_text,
          sourceLanguage: translationResult.source_lang,
          targetLanguage: translationResult.target_lang,
          confidence: translationResult.confidence,
          processingTime,
          quality,
          model: translationResult.model_used,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      logger.error('Translation failed', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Translation failed',
          details: error.response?.data || error.message
        }
      });
    }
  })
);

/**
 * @swagger
 * /api/translation/batch:
 *   post:
 *     summary: Batch translate multiple texts
 *     tags: [Translation]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/batch',
  authenticateToken,
  [
    body('texts').isArray({ min: 1, max: 100 }),
    body('texts.*').isString().trim().isLength({ min: 1, max: 5000 }),
    body('sourceLanguage').isString().isLength({ min: 2, max: 5 }),
    body('targetLanguage').isString().isLength({ min: 2, max: 5 }),
    body('quality').optional().isIn(['fast', 'balanced', 'high']),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    try {
      const { texts, sourceLanguage, targetLanguage, quality = 'balanced' } = req.body;
      const startTime = Date.now();

      // Call AI service for batch translation
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/translation/translate-batch`, {
        texts,
        source_lang: sourceLanguage,
        target_lang: targetLanguage,
        model: 'marian'
      });

      const totalProcessingTime = Date.now() - startTime;
      const batchResult = aiResponse.data;

      // Save translations to database
      const translations = batchResult.translations.map((translation: any, index: number) => ({
        userId: req.user?.id,
        sourceText: texts[index],
        translatedText: translation.translated_text,
        sourceLanguage: translation.source_lang,
        targetLanguage: translation.target_lang,
        model: translation.model_used,
        confidence: translation.confidence,
        processingTime: translation.processing_time,
        quality,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          sessionId: req.sessionID,
          batchId: Date.now().toString(),
        }
      }));

      await Translation.insertMany(translations);

      logger.info('Batch translation completed', {
        userId: req.user?.id,
        batchSize: texts.length,
        totalProcessingTime,
        sourceLanguage,
        targetLanguage
      });

      res.json({
        success: true,
        data: {
          translations: batchResult.translations,
          totalProcessingTime: batchResult.total_processing_time,
          successCount: batchResult.translations.length,
          errorCount: 0
        }
      });
    } catch (error: any) {
      logger.error('Batch translation failed', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Batch translation failed',
          details: error.response?.data || error.message
        }
      });
    }
  })
);

/**
 * @swagger
 * /api/translation/detect-language:
 *   post:
 *     summary: Detect language of text
 *     tags: [Translation]
 */
router.post(
  '/detect-language',
  [
    body('text').isString().trim().isLength({ min: 1, max: 1000 }),
    body('confidenceThreshold').optional().isFloat({ min: 0, max: 1 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    try {
      const { text, confidenceThreshold = 0.8 } = req.body;

      // Call AI service for language detection
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/translation/detect-language`, {
        text,
        confidence_threshold: confidenceThreshold
      });

      const result = aiResponse.data;

      logger.info('Language detection completed', {
        userId: req.user?.id,
        detectedLanguage: result.detected_language,
        confidence: result.confidence,
        textLength: text.length
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Language detection failed', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Language detection failed',
          details: error.response?.data || error.message
        }
      });
    }
  })
);

/**
 * @swagger
 * /api/translation/languages:
 *   get:
 *     summary: Get supported languages
 *     tags: [Translation]
 */
router.get(
  '/languages',
  asyncHandler(async (req, res) => {
    try {
      // Call AI service for supported languages
      const aiResponse = await axios.get(`${AI_SERVICE_URL}/ai/translation/supported-languages`);
      
      res.json({
        success: true,
        data: aiResponse.data
      });
    } catch (error: any) {
      logger.error('Failed to get supported languages', { error: error.message });
      
      // Fallback to static list
      res.json({
        success: true,
        data: {
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
        }
      });
    }
  })
);

/**
 * @swagger
 * /api/translation/history:
 *   get:
 *     summary: Get user's translation history
 *     tags: [Translation]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/history',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sourceLanguage').optional().isString(),
    query('targetLanguage').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const filter: any = { userId: req.user?.id };
      
      if (req.query.sourceLanguage) {
        filter.sourceLanguage = req.query.sourceLanguage;
      }
      if (req.query.targetLanguage) {
        filter.targetLanguage = req.query.targetLanguage;
      }

      const [translations, total] = await Promise.all([
        Translation.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Translation.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          translations,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      logger.error('Failed to get translation history', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get translation history'
        }
      });
    }
  })
);

/**
 * @swagger
 * /api/translation/memory:
 *   post:
 *     summary: Add translation to memory
 *     tags: [Translation]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/memory',
  authenticateToken,
  [
    body('sourceText').isString().trim().isLength({ min: 1, max: 500 }),
    body('translatedText').isString().trim().isLength({ min: 1, max: 500 }),
    body('sourceLanguage').isString().isLength({ min: 2, max: 5 }),
    body('targetLanguage').isString().isLength({ min: 2, max: 5 }),
    body('context').optional().isString().trim().isLength({ max: 100 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array(),
        },
      });
    }

    try {
      const { sourceText, translatedText, sourceLanguage, targetLanguage, context } = req.body;

      const memoryEntry = {
        sourceText,
        translatedText,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage,
        context,
        createdAt: new Date()
      };

      await User.findByIdAndUpdate(req.user?.id, {
        $push: {
          'preferences.glossary': {
            $each: [memoryEntry],
            $slice: -1000 // Keep only last 1000 entries
          }
        }
      });

      logger.info('Translation memory entry added', {
        userId: req.user?.id,
        sourceLanguage,
        targetLanguage
      });

      res.json({
        success: true,
        message: 'Translation memory entry added',
        data: memoryEntry
      });
    } catch (error: any) {
      logger.error('Failed to add translation memory entry', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to add translation memory entry'
        }
      });
    }
  })
);

/**
 * @swagger
 * /api/translation/memory:
 *   get:
 *     summary: Get user's translation memory
 *     tags: [Translation]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/memory',
  authenticateToken,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().trim(),
  ],
  asyncHandler(async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const user = await User.findById(req.user?.id).select('preferences.glossary');
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      let glossary = user.preferences?.glossary || [];

      // Filter by search term if provided
      if (search) {
        const searchLower = search.toLowerCase();
        glossary = glossary.filter(entry => 
          entry.sourceText.toLowerCase().includes(searchLower) ||
          entry.translatedText.toLowerCase().includes(searchLower) ||
          entry.context?.toLowerCase().includes(searchLower)
        );
      }

      // Sort by creation date (newest first)
      glossary.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Paginate
      const total = glossary.length;
      const startIndex = (page - 1) * limit;
      const paginatedGlossary = glossary.slice(startIndex, startIndex + limit);

      res.json({
        success: true,
        data: {
          entries: paginatedGlossary,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      logger.error('Failed to get translation memory', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get translation memory'
        }
      });
    }
  })
);

export { router as translationRoutes };