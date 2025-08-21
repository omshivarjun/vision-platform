const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-jwt-secret-for-development-only';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-for-development-only';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    this.microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
    this.microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    this.oauthCallbackUrl = process.env.OAUTH_CALLBACK_URL || 'http://localhost:5000/api/auth/microsoft/callback';
    
    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      logger.warn('JWT secrets not configured, using defaults for development');
    }
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      subscription: user.subscription?.plan || 'free',
      type: 'access'
    };

    return jwt.sign(payload, this.jwtSecret, { 
      expiresIn: this.jwtExpiresIn 
    });
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, this.jwtRefreshSecret, { 
      expiresIn: this.jwtRefreshExpiresIn 
    });
  }

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      logger.error('Access token verification failed', { error: error.message });
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtRefreshSecret);
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      logger.error('Refresh token verification failed', { error: error.message });
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Handle Microsoft OAuth callback
   */
  async handleMicrosoftCallback(code, state) {
    try {
      if (!this.microsoftClientId || !this.microsoftClientSecret) {
        throw new Error('Microsoft OAuth not configured');
      }

      logger.info('Processing Microsoft OAuth callback');

      // Exchange authorization code for access token
      const tokenParams = new URLSearchParams({
        client_id: this.microsoftClientId,
        client_secret: this.microsoftClientSecret,
        code: code,
        redirect_uri: this.oauthCallbackUrl,
        grant_type: 'authorization_code'
      });

      const tokenResponse = await axios.post(
        'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        tokenParams.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Get user information from Microsoft Graph
      const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      // Try to get user photo
      let photoUrl = null;
      try {
        await axios.get('https://graph.microsoft.com/v1.0/me/photo', {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });
        photoUrl = `https://graph.microsoft.com/v1.0/me/photo/$value`;
      } catch (photoError) {
        logger.debug('User photo not available');
      }

      const microsoftUser = userResponse.data;
      
      // Create or update user in database
      const user = await this.createOrUpdateUser({
        email: microsoftUser.mail || microsoftUser.userPrincipalName,
        name: microsoftUser.displayName,
        microsoftId: microsoftUser.id,
        avatar: photoUrl
      });

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info('Microsoft OAuth authentication successful', {
        userId: user.id,
        email: user.email
      });

      return {
        user,
        accessToken,
        refreshToken,
        expiresIn: expires_in
      };

    } catch (error) {
      logger.error('Microsoft OAuth callback failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create or update user from OAuth data
   */
  async createOrUpdateUser(oauthData) {
    try {
      // TODO: Implement database operations
      // For now, return mock user data
      const user = {
        id: oauthData.microsoftId || 'user_' + Date.now(),
        email: oauthData.email,
        name: oauthData.name,
        avatar: oauthData.avatar,
        microsoftId: oauthData.microsoftId,
        subscription: {
          plan: 'free',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info('User created/updated from OAuth', {
        userId: user.id,
        email: user.email
      });

      return user;

    } catch (error) {
      logger.error('Failed to create/update user', { error: error.message });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // TODO: Get user from database
      const user = {
        id: decoded.id,
        email: decoded.email,
        name: 'User',
        subscription: { plan: 'free' }
      };

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      logger.info('Access token refreshed', {
        userId: user.id
      });

      return {
        accessToken: newAccessToken,
        expiresIn: parseInt(this.jwtExpiresIn) * 60 // Convert to seconds
      };

    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get Microsoft OAuth URL
   */
  getMicrosoftOAuthUrl(state) {
    if (!this.microsoftClientId) {
      throw new Error('Microsoft OAuth not configured');
    }

    const params = new URLSearchParams({
      client_id: this.microsoftClientId,
      response_type: 'code',
      redirect_uri: this.oauthCallbackUrl,
      scope: 'openid profile email User.Read',
      response_mode: 'query',
      state: state || 'default',
      prompt: 'select_account'
    });

    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Validate OAuth state parameter
   */
  validateOAuthState(state, expectedState) {
    return state === expectedState;
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Get OAuth configuration status
   */
  getOAuthStatus() {
    return {
      microsoft: {
        configured: !!(this.microsoftClientId && this.microsoftClientSecret),
        clientId: this.microsoftClientId ? '***' + this.microsoftClientId.slice(-4) : null,
        callbackUrl: this.oauthCallbackUrl
      },
      jwt: {
        configured: !!(this.jwtSecret && this.jwtRefreshSecret),
        expiresIn: this.jwtExpiresIn,
        refreshExpiresIn: this.jwtRefreshExpiresIn
      }
    };
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logoutUser(userId, refreshToken) {
    try {
      // TODO: Implement refresh token blacklisting in database
      logger.info('User logged out', { userId });
      return true;
    } catch (error) {
      logger.error('Logout failed', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AuthService();


