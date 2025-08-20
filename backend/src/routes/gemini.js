const express = require('express');
const router = express.Router();
const GeminiService = require('../services/geminiService');
const { authenticateToken } = require('../middleware/auth');

// Initialize GEMINI service
const geminiService = new GeminiService();

/**
 * POST /api/gemini/generate
 * Generate content using GEMINI AI
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, context, model, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    // Check if service is configured
    if (!geminiService.isConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI service not configured. Please set GOOGLE_API_KEY'
      });
    }

    let result;
    
    if (context) {
      // Use long context method
      result = await geminiService.generateWithLongContext(prompt, context, {
        model,
        ...options
      });
    } else {
      // Use standard method
      result = await geminiService.generateContent(prompt, {
        model,
        ...options
      });
    }

    if (result.success) {
      res.json({
        success: true,
        data: {
          text: result.text,
          model: result.model,
          usage: result.usage,
          timestamp: result.timestamp
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        errorType: result.errorType,
        timestamp: result.timestamp
      });
    }

  } catch (error) {
    console.error('GEMINI route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * POST /api/gemini/generate-with-files
 * Generate content with file attachments
 */
router.post('/generate-with-files', authenticateToken, async (req, res) => {
  try {
    const { prompt, files, model, options } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Files array is required'
      });
    }

    // Check if service is configured
    if (!geminiService.isConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI service not configured. Please set GOOGLE_API_KEY'
      });
    }

    const result = await geminiService.generateWithFiles(prompt, files, {
      model,
      ...options
    });

    if (result.success) {
      res.json({
        success: true,
        data: {
          text: result.text,
          model: result.model,
          usage: result.usage,
          timestamp: result.timestamp
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        errorType: result.errorType,
        timestamp: result.timestamp
      });
      });
    }

  } catch (error) {
    console.error('GEMINI files route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

/**
 * GET /api/gemini/models
 * Get available GEMINI models
 */
router.get('/models', authenticateToken, async (req, res) => {
  try {
    const models = geminiService.getAvailableModels();
    res.json({
      success: true,
      data: {
        models,
        defaultModel: geminiService.defaultModel,
        configured: geminiService.isConfigured()
      }
    });
  } catch (error) {
    console.error('GEMINI models route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/gemini/status
 * Get GEMINI service status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        configured: geminiService.isConfigured(),
        defaultModel: geminiService.defaultModel,
        maxTokens: geminiService.maxTokens,
        functionCallingEnabled: geminiService.enableFunctionCalling
      }
    });
  } catch (error) {
    console.error('GEMINI status route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;

