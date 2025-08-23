import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('firstName').trim().isLength({ min: 2, max: 50 }),
    body('lastName').trim().isLength({ min: 2, max: 50 }),
    body('role').optional().isIn(['user', 'admin', 'moderator']),
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
      const { email, password, firstName, lastName, role = 'user' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'User already exists with this email',
          },
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      await user.save();

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      logger.info('User registered successfully', {
        userId: user._id,
        email: user.email,
        role: user.role
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
          },
        },
      });
    } catch (error: any) {
      logger.error('Registration failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'Registration failed',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
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
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email, isActive: true }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
          },
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
          },
        });
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      logger.info('User logged in successfully', {
        userId: user._id,
        email: user.email,
        lastLogin: user.lastLoginAt
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
          },
        },
      });
    } catch (error: any) {
      logger.error('Login failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: {
          message: 'Login failed',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 */
router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty(),
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
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Invalid refresh token',
          },
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      logger.info('Token refreshed successfully', {
        userId: user._id,
        email: user.email
      });

      res.json({
        success: true,
        data: {
          accessToken,
          expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
        },
      });
    } catch (error: any) {
      logger.error('Token refresh failed', { error: error.message });
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user?.id);
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
        data: user.toJSON(),
      });
    } catch (error: any) {
      logger.error('Failed to get user profile', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get user profile',
        },
      });
    }
  })
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    try {
      // In a production app, you might want to blacklist the token
      // For now, we'll just log the logout
      logger.info('User logged out', {
        userId: req.user?.id,
        email: req.user?.email
      });

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      logger.error('Logout failed', { 
        error: error.message,
        userId: req.user?.id 
      });
      
      res.status(500).json({
        success: false,
        error: {
          message: 'Logout failed',
        },
      });
    }
  })
);

export { router as authRoutes };