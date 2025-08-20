"""
Database connection management for AI Service
"""

import motor.motor_asyncio
import redis.asyncio as redis
from loguru import logger
from typing import Optional

from .config import settings

# MongoDB connection
mongodb_client: Optional[motor.motor_asyncio.AsyncIOMotorClient] = None
mongodb_database: Optional[motor.motor_asyncio.AsyncIOMotorDatabase] = None

# Redis connection
redis_client: Optional[redis.Redis] = None

async def init_db():
    """Initialize database connections"""
    global mongodb_client, mongodb_database, redis_client
    
    try:
        # Initialize MongoDB
        logger.info("Connecting to MongoDB...")
        mongodb_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URI)
        # Get database name from URI or use default
        db_name = settings.MONGODB_URI.split('/')[-1].split('?')[0] if '/' in settings.MONGODB_URI else 'vision_platform'
        if not db_name or db_name == '':
            db_name = 'vision_platform'
        mongodb_database = mongodb_client.get_database(db_name)
        
        # Test MongoDB connection
        await mongodb_client.admin.command('ping')
        logger.info("MongoDB connected successfully")
        
        # Initialize Redis
        logger.info("Connecting to Redis...")
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        
        # Test Redis connection
        await redis_client.ping()
        logger.info("Redis connected successfully")
        
    except Exception as e:
        logger.error(f"Failed to connect to databases: {e}")
        raise

async def close_db():
    """Close database connections"""
    global mongodb_client, redis_client
    
    try:
        if mongodb_client:
            mongodb_client.close()
            logger.info("MongoDB connection closed")
        
        if redis_client:
            await redis_client.close()
            logger.info("Redis connection closed")
            
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")

def get_mongodb() -> motor.motor_asyncio.AsyncIOMotorDatabase:
    """Get MongoDB database instance"""
    if not mongodb_database:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return mongodb_database

def get_redis() -> redis.Redis:
    """Get Redis client instance"""
    if not redis_client:
        raise RuntimeError("Redis not initialized. Call init_db() first.")
    return redis_client
