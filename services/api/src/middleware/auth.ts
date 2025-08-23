import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import { AuthenticationError, AuthorizationError } from './errorHandler';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthenticationError('Access token required');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET not configured');
      throw new AuthenticationError('Authentication service unavailable');
    }

    const decoded = jwt.verify(token, secret) as any;
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or inactive');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AuthorizationError(`Access denied. Required roles: ${roles.join(', ')}`));
      return;
    }

    next();
  };
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireRole(['admin'])(req, res, next);
}

export function requireUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireRole(['user', 'admin', 'moderator'])(req, res, next);
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next();
    }

    const decoded = jwt.verify(token, secret) as any;
    User.findById(decoded.userId)
      .then(user => {
        if (user && user.isActive) {
          req.user = user;
          req.token = token;
        }
        next();
      })
      .catch(() => next());
  } catch (error) {
    // If token is invalid, just continue without authentication
    next();
  }
}