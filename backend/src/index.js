const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const translationRoutes = require('./routes/translation');
const analyticsRoutes = require('./routes/analytics');
const healthRoutes = require('./routes/health');
const configRoutes = require('./routes/config');
// const gcpRoutes = require('./routes/gcp'); // Temporarily disabled for local development

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

// Import services
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check (public)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Vision Platform Backend',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/config', configRoutes);
// app.use('/api/gcp', gcpRoutes); // Temporarily disabled for local development

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Vision Platform Backend API',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      translation: '/api/translation',
      analytics: '/api/analytics',
      protected: '/api/protected'
    },
    documentation: '/api/docs'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use(notFoundHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Vision Platform Backend Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔧 API Base: http://localhost:${PORT}/api`);
  
  // Log environment info
  logger.info('Environment Configuration', {
    nodeEnv: process.env.NODE_ENV,
    port: PORT,
    corsOrigin: process.env.CORS_ORIGIN,
    analyticsEnabled: process.env.ENABLE_ANALYTICS,
    maxFileSize: process.env.MAX_FILE_SIZE
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;

