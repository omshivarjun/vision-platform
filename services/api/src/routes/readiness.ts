import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Redis from 'redis';

const router = Router();

// Helper to check MongoDB
async function checkMongo() {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }
    return true;
  } catch {
    return false;
  }
}

// Helper to check Redis
async function checkRedis() {
  try {
    // Use global redis client if available, else try to connect
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = Redis.createClient({ url: redisUrl });
    await client.connect();
    await client.ping();
    await client.disconnect();
    return true;
  } catch {
    return false;
  }
}

// /readyz endpoint
router.get('/readyz', async (req: Request, res: Response) => {
  const mongoOk = await checkMongo();
  const redisOk = await checkRedis();
  if (mongoOk && redisOk) {
    res.status(200).json({ status: 'ready', mongo: true, redis: true });
  } else {
    res.status(503).json({ status: 'not ready', mongo: mongoOk, redis: redisOk });
  }
});

export { router as readinessRoutes };
