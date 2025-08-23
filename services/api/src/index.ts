/**
 * Vision Platform Backend API
 * Express.js server with TypeScript
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes and middleware
import { connectDB } from './database/connection';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { authRoutes } from './routes/auth';
import { translationRoutes } from './routes/translation';
import { accessibilityRoutes } from './routes/accessibility';
import { userRoutes } from './routes/users';
import { healthRoutes } from './routes/health';
import { readinessRoutes } from './routes/readiness';
import imageGenerationRouter from './routes/imageGeneration';
import sentimentRouter from './routes/sentiment';
import ocrRouter from './routes/ocr';
import ttsRouter from './routes/tts';
import { setupWebSocket } from './websocket/setup';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

// Import types
// Avoid importing Express namespace types to prevent TS conflicts

// Create Express app
const app = express();
const server = createServer(app);

// Create Socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoints
app.use('/health', healthRoutes);
app.use('/healthz', healthRoutes);

// Readiness endpoint
app.use('/readyz', readinessRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/accessibility', accessibilityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/image-generation', imageGenerationRouter);
app.use('/api/sentiment', sentimentRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/tts', ttsRouter);

// API documentation
// Serve Swagger UI from YAML spec
try {
  const swaggerPath = path.join(__dirname, 'swagger', 'swagger.yaml');
  const swaggerFile = fs.readFileSync(swaggerPath, 'utf8');
  const swaggerDoc = YAML.parse(swaggerFile);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (e) {
  console.warn('Swagger spec not found or failed to load:', (e as Error).message);
}

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Vision Platform Backend API',
    version: '1.0.0',
    status: 'running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Setup WebSocket
setupWebSocket(io);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
