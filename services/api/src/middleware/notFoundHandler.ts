import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.warn('Route not found:', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.path,
      method: req.method,
    },
    timestamp: new Date().toISOString(),
    suggestions: [
      'Check the URL spelling',
      'Verify the HTTP method',
      'Consult the API documentation at /api-docs',
    ],
  });
}
