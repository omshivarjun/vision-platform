const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * @route GET /api/health
 * @desc Get API health status
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Vision Platform Backend API',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    };

    logger.debug('Health check requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

/**
 * @route GET /api/health/detailed
 * @desc Get detailed health status including dependencies
 * @access Public
 */
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Vision Platform Backend API',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      dependencies: {
        // TODO: Add actual dependency health checks
        mongodb: 'unknown',
        redis: 'unknown',
        minio: 'unknown'
      },
      configuration: {
        corsOrigin: process.env.CORS_ORIGIN ? 'configured' : 'not configured',
        jwtSecret: process.env.JWT_SECRET ? 'configured' : 'not configured',
        microsoftOAuth: process.env.MICROSOFT_CLIENT_ID ? 'configured' : 'not configured',
        analytics: process.env.ENABLE_ANALYTICS === 'true' ? 'enabled' : 'disabled'
      }
    };

    logger.debug('Detailed health check requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: detailedHealth
    });

  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Detailed health check failed'
    });
  }
});

/**
 * @route GET /api/health/ready
 * @desc Check if service is ready to handle requests
 * @access Public
 */
router.get('/ready', async (req, res) => {
  try {
    // TODO: Add actual readiness checks (database connections, etc.)
    const isReady = true;

    if (isReady) {
      res.json({
        success: true,
        data: {
          status: 'ready',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'Service not ready',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    
    res.status(503).json({
      success: false,
      error: 'Service not ready',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/health/live
 * @desc Check if service is alive (basic liveness probe)
 * @access Public
 */
router.get('/live', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'alive',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;


