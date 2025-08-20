const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT access token
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = authService.verifyAccessToken(token);
    
    // Add user info to request
    req.user = decoded;
    
    logger.debug('Token authenticated successfully', {
      userId: decoded.id,
      email: decoded.email
    });

    next();

  } catch (error) {
    logger.warn('Token authentication failed', { error: error.message });
    
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired access token'
    });
  }
};

/**
 * Middleware to authenticate JWT refresh token
 */
const authenticateRefreshToken = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = authService.verifyRefreshToken(refreshToken);
    
    // Add user info to request
    req.user = decoded;
    
    logger.debug('Refresh token authenticated successfully', {
      userId: decoded.id,
      email: decoded.email
    });

    next();

  } catch (error) {
    logger.warn('Refresh token authentication failed', { error: error.message });
    
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = authService.verifyAccessToken(token);
        req.user = decoded;
        logger.debug('Optional auth successful', { userId: decoded.id });
      } catch (error) {
        logger.debug('Optional auth failed, continuing without user', { error: error.message });
      }
    }

    next();

  } catch (error) {
    logger.debug('Optional auth error, continuing without user', { error: error.message });
    next();
  }
};

/**
 * Role-based access control middleware
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRole = req.user.subscription || 'free';
    
    if (!roles.includes(userRole)) {
      logger.warn('Insufficient role access', {
        userId: req.user.id,
        userRole,
        requiredRoles: roles
      });
      
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Subscription plan check middleware
 */
const requirePlan = (minPlan) => {
  const planHierarchy = {
    'free': 0,
    'pro': 1,
    'enterprise': 2
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userPlan = req.user.subscription || 'free';
    const userPlanLevel = planHierarchy[userPlan] || 0;
    const requiredPlanLevel = planHierarchy[minPlan] || 0;

    if (userPlanLevel < requiredPlanLevel) {
      logger.warn('Insufficient plan access', {
        userId: req.user.id,
        userPlan,
        requiredPlan: minPlan
      });
      
      return res.status(403).json({
        success: false,
        error: `This feature requires ${minPlan} plan or higher`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
  optionalAuth,
  requireRole,
  requirePlan
};


