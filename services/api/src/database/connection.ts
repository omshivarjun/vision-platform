import mongoose from 'mongoose';
import Redis from 'redis';

// MongoDB connection
export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/vision_platform?authSource=admin';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Redis connection
export async function connectRedis() {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisClient = Redis.createClient({ url: redisUrl });
    
    await redisClient.connect();
    console.log('✅ Connected to Redis');
    
    // Handle connection events
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    
    redisClient.on('disconnect', () => {
      console.log('Redis disconnected');
    });
    
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    // Don't exit process for Redis failure, continue without caching
    return null;
  }
}
