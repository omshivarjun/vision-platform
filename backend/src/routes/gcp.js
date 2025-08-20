/**
 * Google Cloud Platform (GCP) Routes
 * Handles all GCP service operations
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const gcpService = require('../services/gcpService');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/gcp/status
 * Get GCP service status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = gcpService.getServiceStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gcp/services
 * Get available GCP services
 */
router.get('/services', authenticateToken, async (req, res) => {
  try {
    const services = gcpService.getAvailableServices();
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gcp/storage/upload
 * Upload file to Google Cloud Storage
 */
router.post('/storage/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const result = await gcpService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gcp/storage/download/:fileName
 * Download file from Google Cloud Storage
 */
router.get('/storage/download/:fileName', authenticateToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    const result = await gcpService.downloadFile(fileName);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(result.buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/gcp/storage/:fileName
 * Delete file from Google Cloud Storage
 */
router.delete('/storage/:fileName', authenticateToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    const result = await gcpService.deleteFile(fileName);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gcp/translation
 * Translate text using Google Cloud Translation
 */
router.post('/translation', authenticateToken, async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Text and target language are required'
      });
    }

    const result = await gcpService.translateText(text, targetLanguage, sourceLanguage);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gcp/vision/analyze
 * Analyze image using Google Cloud Vision
 */
router.post('/vision/analyze', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image provided'
      });
    }

    const result = await gcpService.analyzeImage(req.file.buffer);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gcp/speech/transcribe
 * Convert speech to text using Google Cloud Speech
 */
router.post('/speech/transcribe', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    const { languageCode = 'en-US' } = req.body;
    const result = await gcpService.speechToText(req.file.buffer, languageCode);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/gcp/speech/synthesize
 * Convert text to speech using Google Cloud Text-to-Speech
 */
router.post('/speech/synthesize', authenticateToken, async (req, res) => {
  try {
    const { text, voiceName = 'en-US-Standard-A', languageCode = 'en-US' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const result = await gcpService.textToSpeech(text, voiceName, languageCode);

    res.setHeader('Content-Type', 'audio/mp3');
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
    res.send(Buffer.from(result.audioContent, 'base64'));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/gcp/voices
 * Get available text-to-speech voices
 */
router.get('/voices', authenticateToken, async (req, res) => {
  try {
    // This would typically call GCP to get available voices
    // For now, return common voices
    const voices = [
      { name: 'en-US-Standard-A', languageCode: 'en-US', gender: 'FEMALE' },
      { name: 'en-US-Standard-B', languageCode: 'en-US', gender: 'MALE' },
      { name: 'en-US-Standard-C', languageCode: 'en-US', gender: 'FEMALE' },
      { name: 'en-US-Standard-D', languageCode: 'en-US', gender: 'MALE' },
      { name: 'es-ES-Standard-A', languageCode: 'es-ES', gender: 'FEMALE' },
      { name: 'fr-FR-Standard-A', languageCode: 'fr-FR', gender: 'FEMALE' },
      { name: 'de-DE-Standard-A', languageCode: 'de-DE', gender: 'FEMALE' },
      { name: 'ja-JP-Standard-A', languageCode: 'ja-JP', gender: 'FEMALE' }
    ];

    res.json({
      success: true,
      data: voices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

