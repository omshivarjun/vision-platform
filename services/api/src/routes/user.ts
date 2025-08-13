import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireUser } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { User } from '../models/User';

const router = Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/profile',
  authenticateToken,
  requireUser,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user?.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Profile retrieval failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve profile',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/profile',
  authenticateToken,
  requireUser,
  [
    body('name').optional().isString().trim().isLength({ min: 2, max: 50 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('preferences').optional().isObject(),
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
      const { name, email, preferences } = req.body;
      const updateData: any = {};
      
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (preferences) updateData.preferences = preferences;

      const user = await User.findByIdAndUpdate(
        req.user?.id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      logger.info('Profile updated', {
        userId: req.user?.id,
        updates: Object.keys(updateData),
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      logger.error('Profile update failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update profile',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/users/glossary:
 *   get:
 *     summary: Get user's translation glossary
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Glossary retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/glossary',
  authenticateToken,
  requireUser,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user?.id).select('preferences.glossary');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      const glossary = user.preferences?.glossary || [];

      res.json({
        success: true,
        data: {
          glossary,
          totalEntries: glossary.length,
        },
      });
    } catch (error) {
      logger.error('Glossary retrieval failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve glossary',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/users/glossary:
 *   post:
 *     summary: Add entry to user's translation glossary
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceText
 *               - translatedText
 *               - sourceLang
 *               - targetLang
 *             properties:
 *               sourceText:
 *                 type: string
 *               translatedText:
 *                 type: string
 *               sourceLang:
 *                 type: string
 *               targetLang:
 *                 type: string
 *               context:
 *                 type: string
 *     responses:
 *       200:
 *         description: Glossary entry added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/glossary',
  authenticateToken,
  requireUser,
  [
    body('sourceText').isString().trim().notEmpty(),
    body('translatedText').isString().trim().notEmpty(),
    body('sourceLang').isString().isLength({ min: 2, max: 5 }),
    body('targetLang').isString().isLength({ min: 2, max: 5 }),
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
      const { sourceText, translatedText, sourceLang, targetLang, context } = req.body;
      
      const newEntry = {
        sourceText,
        translatedText,
        sourceLang,
        targetLang,
        context,
        createdAt: new Date(),
      };

      const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
          $push: { 'preferences.glossary': newEntry },
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      logger.info('Glossary entry added', {
        userId: req.user?.id,
        sourceLang,
        targetLang,
      });

      res.json({
        success: true,
        message: 'Glossary entry added successfully',
        data: newEntry,
      });
    } catch (error) {
      logger.error('Glossary entry addition failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to add glossary entry',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/users/glossary/{entryId}:
 *   delete:
 *     summary: Remove entry from user's translation glossary
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Glossary entry removed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/glossary/:entryId',
  authenticateToken,
  requireUser,
  asyncHandler(async (req, res) => {
    try {
      const { entryId } = req.params;
      
      const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
          $pull: { 'preferences.glossary': { _id: entryId } },
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      logger.info('Glossary entry removed', {
        userId: req.user?.id,
        entryId,
      });

      res.json({
        success: true,
        message: 'Glossary entry removed successfully',
      });
    } catch (error) {
      logger.error('Glossary entry removal failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to remove glossary entry',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/users/translation-history:
 *   get:
 *     summary: Get user's translation history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of entries to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of entries to skip
 *     responses:
 *       200:
 *         description: Translation history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/translation-history',
  authenticateToken,
  requireUser,
  asyncHandler(async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const user = await User.findById(req.user?.id).select('preferences.translationHistory');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
      }

      const history = user.preferences?.translationHistory || [];
      const paginatedHistory = history.slice(offset, offset + limit);

      res.json({
        success: true,
        data: {
          history: paginatedHistory,
          total: history.length,
          limit,
          offset,
        },
      });
    } catch (error) {
      logger.error('Translation history retrieval failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve translation history',
        },
      });
    }
  })
);

export default router;
