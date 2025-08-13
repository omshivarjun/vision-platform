import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export function setupSocketIO(io: Server): void {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error('JWT secret not configured'));
      }

      const decoded = jwt.verify(token, secret) as any;
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Invalid or inactive user'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', { error: error.message });
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const user = socket.user!;

    logger.info('User connected to Socket.IO:', { userId, email: user.email });

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Handle translation requests
    socket.on('translation:request', async (data) => {
      try {
        logger.info('Translation request received:', { userId, data });
        
        // Emit to user's room
        socket.emit('translation:result', {
          success: true,
          data: {
            originalText: data.text,
            translatedText: `[Translated: ${data.text}]`, // Placeholder - would call AI service
            sourceLanguage: data.sourceLanguage || 'auto',
            targetLanguage: data.targetLanguage,
            confidence: 0.95
          }
        });
      } catch (error) {
        logger.error('Translation request error:', { userId, error: error.message });
        socket.emit('translation:result', {
          success: false,
          error: 'Translation failed'
        });
      }
    });

    // Handle speech recognition requests
    socket.on('speech:start', (data) => {
      logger.info('Speech recognition started:', { userId, data });
      socket.emit('speech:status', { status: 'processing' });
    });

    socket.on('speech:audio', async (data) => {
      try {
        logger.info('Speech audio received:', { userId, audioLength: data.audioData?.length });
        
        // Simulate processing delay
        setTimeout(() => {
          socket.emit('speech:result', {
            success: true,
            data: {
              text: '[Recognized speech text]', // Placeholder - would call AI service
              confidence: 0.92,
              language: data.language || 'auto'
            }
          });
        }, 1000);
      } catch (error) {
        logger.error('Speech recognition error:', { userId, error: error.message });
        socket.emit('speech:result', {
          success: false,
          error: 'Speech recognition failed'
        });
      }
    });

    // Handle OCR requests
    socket.on('ocr:request', async (data) => {
      try {
        logger.info('OCR request received:', { userId, imageSize: data.imageData?.length });
        
        // Simulate processing delay
        setTimeout(() => {
          socket.emit('ocr:result', {
            success: true,
            data: {
              text: '[Extracted text from image]', // Placeholder - would call AI service
              confidence: 0.88,
              blocks: [
                {
                  text: '[Sample text block]',
                  boundingBox: { x: 0, y: 0, width: 100, height: 50 }
                }
              ]
            }
          });
        }, 1500);
      } catch (error) {
        logger.error('OCR request error:', { userId, error: error.message });
        socket.emit('ocr:result', {
          success: false,
          error: 'OCR processing failed'
        });
      }
    });

    // Handle scene description requests
    socket.on('scene:request', async (data) => {
      try {
        logger.info('Scene description request received:', { userId, detailLevel: data.detailLevel });
        
        // Simulate processing delay
        setTimeout(() => {
          socket.emit('scene:result', {
            success: true,
            data: {
              description: 'This appears to be a [scene description] with various objects visible.', // Placeholder
              objects: [
                {
                  name: 'object1',
                  confidence: 0.85,
                  boundingBox: { x: 10, y: 20, width: 80, height: 60 }
                }
              ]
            }
          });
        }, 2000);
      } catch (error) {
        logger.error('Scene description error:', { userId, error: error.message });
        socket.emit('scene:result', {
          success: false,
          error: 'Scene description failed'
        });
      }
    });

    // Handle real-time translation conversation
    socket.on('conversation:join', (data) => {
      const { sessionId } = data;
      socket.join(`conversation:${sessionId}`);
      logger.info('User joined conversation:', { userId, sessionId });
      
      socket.emit('conversation:joined', { sessionId, status: 'active' });
    });

    socket.on('conversation:message', (data) => {
      const { sessionId, message, sourceLanguage, targetLanguage } = data;
      
      logger.info('Conversation message received:', { userId, sessionId, messageLength: message.length });
      
      // Broadcast to conversation room
      socket.to(`conversation:${sessionId}`).emit('conversation:message', {
        userId,
        message,
        sourceLanguage,
        targetLanguage,
        timestamp: new Date().toISOString()
      });
    });

    // Handle accessibility features
    socket.on('accessibility:obstacle', (data) => {
      logger.info('Obstacle detection:', { userId, distance: data.distance, direction: data.direction });
      
      // Emit haptic/audio feedback
      socket.emit('accessibility:feedback', {
        type: 'obstacle',
        distance: data.distance,
        direction: data.direction,
        severity: data.distance < 1 ? 'high' : data.distance < 3 ? 'medium' : 'low'
      });
    });

    socket.on('accessibility:navigation', (data) => {
      logger.info('Navigation request:', { userId, destination: data.destination });
      
      // Simulate navigation processing
      setTimeout(() => {
        socket.emit('accessibility:navigation:result', {
          success: true,
          data: {
            route: '[Navigation route instructions]',
            estimatedTime: '5 minutes',
            steps: [
              'Turn right in 50 meters',
              'Continue straight for 200 meters',
              'Destination will be on your left'
            ]
          }
        });
      }, 1000);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('User disconnected from Socket.IO:', { userId, email: user.email, reason });
      
      // Leave all rooms
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', { userId, error: error.message });
    });
  });

  // Broadcast system-wide events
  setInterval(() => {
    io.emit('system:heartbeat', {
      timestamp: new Date().toISOString(),
      activeConnections: io.engine.clientsCount
    });
  }, 30000); // Every 30 seconds

  logger.info('Socket.IO setup completed');
}
