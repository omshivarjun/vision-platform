const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route POST /api/analytics/event
 * @desc Track a custom analytics event
 * @access Private
 */
router.post('/event', authenticateToken, async (req, res) => {
  try {
    const { event, category, properties, sessionId } = req.body;
    const userId = req.user.id;

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'Event name is required'
      });
    }

    logger.info('Custom analytics event received', {
      userId,
      event,
      category: category || 'general'
    });

    const result = await analyticsService.trackEvent(
      userId,
      event,
      category || 'general',
      properties || {},
      sessionId
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Analytics event tracking failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
});

/**
 * @route GET /api/analytics/user
 * @desc Get user analytics summary
 * @access Private
 */
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    logger.info('User analytics request received', {
      userId,
      timeRange
    });

    const analytics = await analyticsService.getUserAnalytics(userId, timeRange);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Failed to get user analytics', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get user analytics'
    });
  }
});

/**
 * @route GET /api/analytics/platform
 * @desc Get platform-wide analytics (admin only)
 * @access Private
 */
router.get('/platform', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeRange = '30d' } = req.query;

    // TODO: Check if user is admin
    // For now, allow all authenticated users
    logger.info('Platform analytics request received', {
      userId,
      timeRange
    });

    const analytics = await analyticsService.getPlatformAnalytics(timeRange);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Failed to get platform analytics', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get platform analytics'
    });
  }
});

/**
 * @route GET /api/analytics/category/:category
 * @desc Get analytics for a specific category
 * @access Private
 */
router.get('/category/:category', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.params;
    const { timeRange = '30d' } = req.query;

    logger.info('Category analytics request received', {
      userId,
      category,
      timeRange
    });

    const analytics = await analyticsService.getAnalyticsByCategory(category, timeRange);

    if (analytics.error) {
      return res.status(400).json({
        success: false,
        error: analytics.error
      });
    }

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Failed to get category analytics', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get category analytics'
    });
  }
});

/**
 * @route POST /api/analytics/document-upload
 * @desc Track document upload event
 * @access Private
 */
router.post('/document-upload', authenticateToken, async (req, res) => {
  try {
    const { documentId, filename, fileSize, fileType } = req.body;
    const userId = req.user.id;

    if (!documentId || !filename) {
      return res.status(400).json({
        success: false,
        error: 'Document ID and filename are required'
      });
    }

    logger.info('Document upload analytics event received', {
      userId,
      documentId,
      filename
    });

    const result = await analyticsService.trackDocumentUpload(
      userId,
      documentId,
      filename,
      fileSize || 0,
      fileType || 'unknown'
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Document upload analytics failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to track document upload'
    });
  }
});

/**
 * @route POST /api/analytics/ocr-processing
 * @desc Track OCR processing event
 * @access Private
 */
router.post('/ocr-processing', authenticateToken, async (req, res) => {
  try {
    const { documentId, provider, processingTime, success } = req.body;
    const userId = req.user.id;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Document ID is required'
      });
    }

    logger.info('OCR processing analytics event received', {
      userId,
      documentId,
      provider,
      success
    });

    const result = await analyticsService.trackOCRProcessing(
      userId,
      documentId,
      provider || 'unknown',
      processingTime || 0,
      success !== false
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('OCR processing analytics failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to track OCR processing'
    });
  }
});

/**
 * @route POST /api/analytics/translation
 * @desc Track translation event
 * @access Private
 */
router.post('/translation', authenticateToken, async (req, res) => {
  try {
    const { sourceLanguage, targetLanguage, provider, textLength, success } = req.body;
    const userId = req.user.id;

    if (!sourceLanguage || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Source and target languages are required'
      });
    }

    logger.info('Translation analytics event received', {
      userId,
      sourceLanguage,
      targetLanguage,
      provider,
      success
    });

    const result = await analyticsService.trackTranslation(
      userId,
      sourceLanguage,
      targetLanguage,
      provider || 'unknown',
      textLength || 0,
      success !== false
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Translation analytics failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to track translation'
    });
  }
});

/**
 * @route POST /api/analytics/authentication
 * @desc Track authentication event
 * @access Private
 */
router.post('/authentication', authenticateToken, async (req, res) => {
  try {
    const { method, success } = req.body;
    const userId = req.user.id;

    if (!method) {
      return res.status(400).json({
        success: false,
        error: 'Authentication method is required'
      });
    }

    logger.info('Authentication analytics event received', {
      userId,
      method,
      success
    });

    const result = await analyticsService.trackAuthentication(
      userId,
      method,
      success !== false
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Authentication analytics failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to track authentication'
    });
  }
});

/**
 * @route POST /api/analytics/feature-usage
 * @desc Track feature usage event
 * @access Private
 */
router.post('/feature-usage', authenticateToken, async (req, res) => {
  try {
    const { feature, success, duration } = req.body;
    const userId = req.user.id;

    if (!feature) {
      return res.status(400).json({
        success: false,
        error: 'Feature name is required'
      });
    }

    logger.info('Feature usage analytics event received', {
      userId,
      feature,
      success,
      duration
    });

    const result = await analyticsService.trackFeatureUsage(
      userId,
      feature,
      success !== false,
      duration
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Feature usage analytics failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to track feature usage'
    });
  }
});

/**
 * @route POST /api/analytics/error
 * @desc Track error event
 * @access Private
 */
router.post('/error', authenticateToken, async (req, res) => {
  try {
    const { error, context, severity } = req.body;
    const userId = req.user.id;

    if (!error) {
      return res.status(400).json({
        success: false,
        error: 'Error information is required'
      });
    }

    logger.info('Error analytics event received', {
      userId,
      context,
      severity: severity || 'error'
    });

    const result = await analyticsService.trackError(
      userId,
      error,
      context || 'unknown',
      severity || 'error'
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error analytics failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to track error'
    });
  }
});

/**
 * @route GET /api/analytics/export
 * @desc Export analytics data
 * @access Private
 */
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'json', timeRange = '30d' } = req.query;

    logger.info('Analytics export requested', {
      userId,
      format,
      timeRange
    });

    const exportData = await analyticsService.exportAnalytics(userId, format, timeRange);

    if (!exportData) {
      return res.status(400).json({
        success: false,
        error: 'Analytics export not available'
      });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${userId}-${timeRange}.json"`);

    res.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    logger.error('Analytics export failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics'
    });
  }
});

/**
 * @route GET /api/analytics/health
 * @desc Get analytics service health status
 * @access Public
 */
router.get('/health', (req, res) => {
  try {
    const health = analyticsService.getHealthStatus();

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    logger.error('Failed to get analytics health', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics health'
    });
  }
});

module.exports = router;


