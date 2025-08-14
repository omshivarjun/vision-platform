import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import axios from 'axios';

const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * @swagger
 * /api/accessibility/scene-description:
 *   post:
 *     summary: Generate scene description for accessibility
 *     tags: [Accessibility]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/scene-description',
  optionalAuth,
  [
    body('detailLevel').optional().isIn(['basic', 'detailed', 'comprehensive']),
    body('includeObjects').optional().isBoolean(),
    body('includeText').optional().isBoolean(),
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
      const { detailLevel = 'detailed', includeObjects = true, includeText = true } = req.body;

      // Forward request to AI service
      const formData = new FormData();
      if (req.file) {
        formData.append('image', req.file.buffer, req.file.originalname);
      }
      formData.append('detail_level', detailLevel);
      formData.append('include_objects', includeObjects.toString());
      formData.append('include_text', includeText.toString());

      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/ai/accessibility/scene-description`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = aiResponse.data;

      logger.info('Scene description completed', {
        userId: req.user?.id,
        detailLevel,
        objectsDetected: result.objects?.length || 0,
        confidence: result.confidence
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Scene description failed', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Scene description failed',
          details: error.response?.data || error.message
        }
      });
    }
  })
);

/**
 * @swagger
 * /api/accessibility/object-detection:
 *   post:
 *     summary: Detect objects in image
 *     tags: [Accessibility]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/object-detection',
  optionalAuth,
  [
    body('confidence').optional().isFloat({ min: 0.1, max: 1.0 }),
    body('maxObjects').optional().isInt({ min: 1, max: 100 }),
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
      const { confidence = 0.7, maxObjects = 20 } = req.body;

      // Forward request to AI service
      const formData = new FormData();
      if (req.file) {
        formData.append('image', req.file.buffer, req.file.originalname);
      }
      formData.append('confidence_threshold', confidence.toString());
      formData.append('max_objects', maxObjects.toString());

      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/ai/accessibility/object-detection`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = aiResponse.data;

      logger.info('Object detection completed', {
        userId: req.user?.id,
        objectsDetected: result.objects?.length || 0,
        confidence
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Object detection failed', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Object detection failed',
          details: error.response?.data || error.message
        }
      });
    }
  })
);

/**
 * @swagger
 * /api/accessibility/navigation:
 *   post:
 *     summary: Get navigation assistance
 *     tags: [Accessibility]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/navigation',
  authenticateToken,
  [
    body('currentLocation').isObject(),
    body('currentLocation.latitude').isFloat({ min: -90, max: 90 }),
    body('currentLocation.longitude').isFloat({ min: -180, max: 180 }),
    body('destination').isString().trim().isLength({ min: 1, max: 200 }),
    body('mode').optional().isIn(['walking', 'transit', 'driving']),
    body('accessibility').optional().isBoolean(),
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
      const { currentLocation, destination, mode = 'walking', accessibility = true } = req.body;

      // Mock navigation response (would integrate with Google Maps/OpenStreetMap)
      const mockRoute = {
        id: Date.now().toString(),
        origin: currentLocation,
        destination: { name: destination },
        mode,
        distance: Math.floor(Math.random() * 2000) + 500, // 500-2500 meters
        duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
        steps: [
          {
            instruction: `Head ${['north', 'south', 'east', 'west'][Math.floor(Math.random() * 4)]} on current street`,
            distance: 100,
            duration: 120,
            maneuver: 'straight',
            location: currentLocation
          },
          {
            instruction: `Turn ${'left' || 'right'} onto Main Street`,
            distance: 200,
            duration: 240,
            maneuver: 'turn-left',
            location: {
              latitude: currentLocation.latitude + 0.001,
              longitude: currentLocation.longitude
            }
          },
          {
            instruction: `Continue straight for 300 meters`,
            distance: 300,
            duration: 360,
            maneuver: 'straight',
            location: {
              latitude: currentLocation.latitude + 0.002,
              longitude: currentLocation.longitude + 0.001
            }
          },
          {
            instruction: `Arrive at ${destination}`,
            distance: 0,
            duration: 0,
            maneuver: 'arrive',
            location: {
              latitude: currentLocation.latitude + 0.003,
              longitude: currentLocation.longitude + 0.001
            }
          }
        ],
        accessibility: {
          wheelchairAccessible: accessibility,
          hasElevators: accessibility,
          hasRamps: accessibility,
          hasAudioSignals: accessibility,
          warnings: accessibility ? [] : ['Route may not be fully accessible']
        }
      };

      logger.info('Navigation route generated', {
        userId: req.user?.id,
        destination,
        mode,
        distance: mockRoute.distance,
        duration: mockRoute.duration
      });

      res.json({
        success: true,
        data: mockRoute
      });
    } catch (error: any) {
      logger.error('Navigation failed', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Navigation failed',
          details: error.message
        }
      });
    }
  })
);

/**
 * @swagger
 * /api/accessibility/voice-command:
 *   post:
 *     summary: Process voice command
 *     tags: [Accessibility]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/voice-command',
  authenticateToken,
  [
    body('command').isString().trim().isLength({ min: 1, max: 200 }),
    body('context').optional().isString().trim(),
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
      const { command, context } = req.body;

      // Process voice command (mock implementation)
      const commandLower = command.toLowerCase();
      let action = 'unknown';
      let parameters = {};
      let confidence = 0.8;

      if (commandLower.includes('translate')) {
        action = 'start_translation';
        parameters = { mode: 'text' };
        confidence = 0.95;
      } else if (commandLower.includes('describe') || commandLower.includes('scene')) {
        action = 'describe_scene';
        parameters = { detail: 'medium' };
        confidence = 0.92;
      } else if (commandLower.includes('navigate') || commandLower.includes('directions')) {
        action = 'start_navigation';
        parameters = { mode: 'walking' };
        confidence = 0.90;
      } else if (commandLower.includes('read') || commandLower.includes('text')) {
        action = 'read_text';
        parameters = { voice: 'default' };
        confidence = 0.88;
      } else if (commandLower.includes('help')) {
        action = 'show_help';
        parameters = {};
        confidence = 0.85;
      }

      const result = {
        id: Date.now().toString(),
        command,
        recognizedCommand: action,
        confidence,
        parameters,
        action: `Execute ${action}`,
        processingTime: 150,
        timestamp: new Date().toISOString()
      };

      logger.info('Voice command processed', {
        userId: req.user?.id,
        command: action,
        confidence
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Voice command processing failed', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Voice command processing failed',
          details: error.message
        }
      });
    }
  })
);

export { router as accessibilityRoutes };