const express = require('express');
const router = express.Router();
const { checkConnection } = require('../database/postgres');
const { MongoClient } = require('mongodb');
const Redis = require('ioredis');

// Comprehensive health check endpoint
router.get('/healthz', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Vision Platform Backend',
    version: process.env.npm_package_version || '1.0.0',
    checks: {}
  };

  // Check PostgreSQL
  try {
    await checkConnection(1, 500);
    health.checks.postgres = { status: 'healthy', message: 'Connected' };
  } catch (error) {
    health.checks.postgres = { status: 'unhealthy', error: error.message };
    health.status = 'degraded';
  }

  // Check MongoDB (if configured)
  if (process.env.MONGODB_URI) {
    try {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      await client.db().admin().ping();
      await client.close();
      health.checks.mongodb = { status: 'healthy', message: 'Connected' };
    } catch (error) {
      health.checks.mongodb = { status: 'unhealthy', error: error.message };
      health.status = 'degraded';
    }
  }

  // Check Redis
  if (process.env.REDIS_URL) {
    try {
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      await redis.quit();
      health.checks.redis = { status: 'healthy', message: 'Connected' };
    } catch (error) {
      health.checks.redis = { status: 'unhealthy', error: error.message };
      health.status = 'degraded';
    }
  }

  // Check AI Service
  if (process.env.AI_SERVICE_URL) {
    try {
      const response = await fetch(`${process.env.AI_SERVICE_URL}/health`);
      if (response.ok) {
        health.checks.ai_service = { status: 'healthy', message: 'Available' };
      } else {
        health.checks.ai_service = { status: 'unhealthy', statusCode: response.status };
        health.status = 'degraded';
      }
    } catch (error) {
      health.checks.ai_service = { status: 'unhealthy', error: error.message };
      health.status = 'degraded';
    }
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
