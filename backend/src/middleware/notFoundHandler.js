/**
 * 404 Not Found handler middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      health: '/health',
      auth: '/api/auth',
      translation: '/api/translation',
      analytics: '/api/analytics',
      protected: '/api/protected'
    }
  });
};

module.exports = notFoundHandler;


