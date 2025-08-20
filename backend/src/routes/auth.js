const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * @route GET /api/auth/microsoft/url
 * @desc Get Microsoft OAuth URL
 * @access Public
 */
router.get('/microsoft/url', (req, res) => {
  try {
    const state = req.query.state || 'default';
    const oauthUrl = authService.getMicrosoftOAuthUrl(state);
    
    res.json({
      success: true,
      data: {
        url: oauthUrl,
        state: state
      }
    });
  } catch (error) {
    logger.error('Failed to generate Microsoft OAuth URL', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'OAuth not configured'
    });
  }
});

/**
 * @route GET /api/auth/microsoft/callback
 * @desc Handle Microsoft OAuth callback
 * @access Public
 */
router.get('/microsoft/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;
    
    // Check for OAuth errors
    if (error) {
      logger.error('Microsoft OAuth error', { error });
      return res.redirect('/auth/error?error=' + encodeURIComponent(error));
    }
    
    if (!code) {
      logger.error('No authorization code received');
      return res.redirect('/auth/error?error=' + encodeURIComponent('No authorization code'));
    }
    
    // Validate state parameter
    if (!authService.validateOAuthState(state, 'default')) {
      logger.error('Invalid OAuth state parameter', { state });
      return res.redirect('/auth/error?error=' + encodeURIComponent('Invalid state parameter'));
    }
    
    logger.info('Processing Microsoft OAuth callback', { code: code.substring(0, 10) + '...' });
    
    // Handle OAuth callback
    const result = await authService.handleMicrosoftCallback(code, state);
    
    // Redirect to frontend with tokens
    const redirectUrl = new URL('/auth/success', process.env.FRONTEND_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('access_token', result.accessToken);
    redirectUrl.searchParams.set('refresh_token', result.refreshToken);
    redirectUrl.searchParams.set('expires_in', result.expiresIn);
    redirectUrl.searchParams.set('user_id', result.user.id);
    
    res.redirect(redirectUrl.toString());
    
  } catch (error) {
    logger.error('Microsoft OAuth callback failed', { error: error.message });
    
    const errorUrl = new URL('/auth/error', process.env.FRONTEND_URL || 'http://localhost:3000');
    errorUrl.searchParams.set('error', error.message);
    
    res.redirect(errorUrl.toString());
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Token refresh failed', { error: error.message });
    
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user and invalidate refresh token
 * @access Private
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }
    
    await authService.logoutUser(userId, refreshToken);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    logger.error('Logout failed', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * @route GET /api/auth/status
 * @desc Get OAuth configuration status
 * @access Public
 */
router.get('/status', (req, res) => {
  try {
    const status = authService.getOAuthStatus();
    
    res.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    logger.error('Failed to get OAuth status', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get OAuth status'
    });
  }
});

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Remove sensitive information
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      subscription: user.subscription,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json({
      success: true,
      data: profile
    });
    
  } catch (error) {
    logger.error('Failed to get user profile', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Validate updates
    const allowedUpdates = ['name', 'preferences'];
    const validUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        validUpdates[key] = value;
      }
    }
    
    if (Object.keys(validUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid updates provided'
      });
    }
    
    // TODO: Implement database update
    // For now, just return success
    logger.info('Profile update requested', {
      userId: user.id,
      updates: validUpdates
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: validUpdates
    });
    
  } catch (error) {
    logger.error('Failed to update user profile', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user information
 * @access Private
 */
router.get('/me', (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
      }
    });
    
  } catch (error) {
    logger.error('Failed to get current user', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get user information'
    });
  }
});

module.exports = router;


