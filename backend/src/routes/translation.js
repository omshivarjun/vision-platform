const express = require('express');
const router = express.Router();
const translationService = require('../services/translationService');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route POST /api/translation/text
 * @desc Translate text from one language to another
 * @access Private
 */
router.post('/text', authenticateToken, async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage, provider } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: text and targetLanguage are required'
      });
    }

    // Validate text length
    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long. Maximum length is 5000 characters'
      });
    }

    logger.info('Translation request received', {
      userId,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
      provider: provider || 'default',
      textLength: text.length
    });

    // Perform translation
    const result = await translationService.translateText(
      text,
      sourceLanguage || 'auto',
      targetLanguage,
      provider
    );

    // Add user ID to result
    result.userId = userId;

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Translation endpoint error', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: error.message || 'Translation failed'
    });
  }
});

/**
 * @route POST /api/translation/batch
 * @desc Translate multiple texts in batch
 * @access Private
 */
router.post('/batch', authenticateToken, async (req, res) => {
  try {
    const { texts, sourceLanguage, targetLanguage, provider } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: texts array is required'
      });
    }

    if (!targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: targetLanguage is required'
      });
    }

    // Validate batch size
    if (texts.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Batch too large. Maximum 10 texts per request'
      });
    }

    // Validate each text
    for (const text of texts) {
      if (!text || typeof text !== 'string' || text.length > 5000) {
        return res.status(400).json({
          success: false,
          error: 'Invalid text in batch. Each text must be a string under 5000 characters'
        });
      }
    }

    logger.info('Batch translation request received', {
      userId,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage,
      provider: provider || 'default',
      batchSize: texts.length
    });

    // Perform batch translation
    const results = [];
    for (const text of texts) {
      try {
        const result = await translationService.translateText(
          text,
          sourceLanguage || 'auto',
          targetLanguage,
          provider
        );
        result.userId = userId;
        results.push(result);
      } catch (error) {
        logger.error('Individual translation failed in batch', { text, error: error.message });
        results.push({
          sourceText: text,
          error: error.message,
          userId
        });
      }
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    logger.error('Batch translation endpoint error', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: error.message || 'Batch translation failed'
    });
  }
});

/**
 * @route GET /api/translation/languages
 * @desc Get supported languages
 * @access Public
 */
router.get('/languages', (req, res) => {
  try {
    const languages = translationService.getSupportedLanguages();
    
    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    logger.error('Languages endpoint error', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve languages'
    });
  }
});

/**
 * @route GET /api/translation/providers
 * @desc Get available translation providers
 * @access Public
 */
router.get('/providers', (req, res) => {
  try {
    const providers = translationService.getAvailableProviders();
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    logger.error('Providers endpoint error', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve providers'
    });
  }
});

/**
 * @route POST /api/translation/detect
 * @desc Detect language of input text
 * @access Private
 */
router.post('/detect', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: text is required'
      });
    }

    logger.info('Language detection request received', {
      userId,
      textLength: text.length
    });

    const detectedLanguage = await translationService.detectLanguage(text);
    
    res.json({
      success: true,
      data: {
        text,
        detectedLanguage,
        confidence: 0.9, // Placeholder confidence score
        userId
      }
    });

  } catch (error) {
    logger.error('Language detection endpoint error', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: error.message || 'Language detection failed'
    });
  }
});

/**
 * @route GET /api/translation/history
 * @desc Get user's translation history
 * @access Private
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, sourceLanguage, targetLanguage } = req.query;

    logger.info('Translation history request received', {
      userId,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // TODO: Implement database query for translation history
    // For now, return empty array
    const history = [];
    
    res.json({
      success: true,
      data: {
        translations: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      }
    });

  } catch (error) {
    logger.error('Translation history endpoint error', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve translation history'
    });
  }
});

module.exports = router;


