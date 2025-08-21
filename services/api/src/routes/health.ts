import { Router, Request, Response } from 'express';

const router = Router();

// Health check endpoint (alias /healthz)
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Vision Platform Backend',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

router.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Vision Platform Backend',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

export { router as healthRoutes };
