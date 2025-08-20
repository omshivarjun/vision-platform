const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error('Unhandled error occurred', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Determine error status and message
  let status = 500;
  let message = 'Internal server error';
  
  if (error.status) {
    status = error.status;
  } else if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    status = 409;
    message = 'Duplicate entry';
  } else if (error.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  // Send error response
  res.status(status).json({
    success: false,
    error: message,
    ...(isDevelopment && { 
      details: error.message,
      stack: error.stack 
    })
  });
};

module.exports = errorHandler;


