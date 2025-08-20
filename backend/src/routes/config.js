/**
 * Configuration Status Routes
 * Shows the status of all services and configurations
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const cloudConfig = require('../config/cloudConfig');
const storageConfig = require('../config/storageConfig');
const testConfig = require('../config/testConfig');

/**
 * GET /api/config/status
 * Get overall configuration status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      
      // Core Services
      database: {
        mongodb: !!process.env.MONGODB_URI,
        redis: !!process.env.REDIS_URL
      },
      
      // AI Services
      ai: {
        openai: !!process.env.OPENAI_API_KEY,
        huggingface: !!process.env.HUGGINGFACE_API_KEY,
        google: !!process.env.GOOGLE_API_KEY,
        'google-cloud': cloudConfig.isGoogleCloudConfigured()
      },
      
      // Storage
      storage: storageConfig.getConfigSummary(),
      
      // Cloud Services
      cloud: cloudConfig.getConfigSummary(),
      
      // Test Configuration
      test: testConfig.getTestConfig(),
      
      // Authentication
      auth: {
        jwt: !!process.env.JWT_SECRET,
        google: !!(process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_CREDENTIALS)
      },
      
      // Payment
      payment: {
        stripe: !!(process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY)
      },
      
      // Communication
      communication: {
        email: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
        push: cloudConfig.getPushNotificationConfig()
      },
      
      // Monitoring
      monitoring: {
        sentry: !!(process.env.SENTRY_DSN_BACKEND || process.env.SENTRY_DSN_FRONTEND)
      }
    };

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
 * GET /api/config/storage
 * Get storage configuration details
 */
router.get('/storage', authenticateToken, async (req, res) => {
  try {
    const config = storageConfig.getAllStorageConfigs();
    
    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

  /**
   * GET /api/config/cloud
   * Get Google Cloud Platform configuration
   */
  router.get('/cloud', authenticateToken, async (req, res) => {
    try {
      const config = {
        google: {
          cloud: cloudConfig.getGoogleCloudConfig(),
          storage: cloudConfig.getGoogleCloudStorageConfig(),
          api: !!process.env.GOOGLE_API_KEY,
          translation: cloudConfig.isGoogleCloudConfigured()
        },
        pushNotifications: cloudConfig.getPushNotificationConfig()
      };
      
      res.json({
        success: true,
        data: config
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

/**
 * GET /api/config/test
 * Get test configuration details
 */
router.get('/test', authenticateToken, async (req, res) => {
  try {
    const config = testConfig.getTestConfig();
    
    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
