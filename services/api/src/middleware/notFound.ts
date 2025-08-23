import { Request, Response } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  });
}
