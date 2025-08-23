import { Router } from 'express';
import mongoose from 'mongoose';
import Redis from 'redis';
import { Storage } from '@google-cloud/storage';

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

async function checkGCS() {
  try {
    const storage = new Storage();
    const [buckets] = await storage.getBuckets({ maxResults: 1 });
    return Array.isArray(buckets);
  } catch {
    return false;
  }
}

// /readyz endpoint
router.get('/readyz', async (req, res) => {
  const [mongoOk, redisOk, gcsOk] = await Promise.all([checkMongo(), checkRedis(), checkGCS()]);
  if (mongoOk && redisOk && gcsOk) {
    res.status(200).json({ status: 'ready', mongo: true, redis: true, gcs: true });
  } else {
    res.status(503).json({ status: 'not ready', mongo: mongoOk, redis: redisOk, gcs: gcsOk });
  }
});

export { router as readinessRoutes };
