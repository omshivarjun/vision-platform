"""
Health check endpoints for AI Service
"""

from fastapi import APIRouter, Depends
from loguru import logger
from app.core.database import get_mongodb, get_redis

router = APIRouter()

@router.get("/")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "vision-ai-service",
        "version": "1.0.0"
    }

@router.get("/detailed")
async def detailed_health_check():
    """Detailed health check with database connectivity"""
    health_status = {
        "status": "healthy",
        "service": "vision-ai-service",
        "version": "1.0.0",
        "checks": {
            "mongodb": "unknown",
            "redis": "unknown"
        }
    }
    
    try:
        # Check MongoDB
        db = get_mongodb()
        await db.admin.command('ping')
        health_status["checks"]["mongodb"] = "healthy"
    except Exception as e:
        logger.error(f"MongoDB health check failed: {e}")
        health_status["checks"]["mongodb"] = "unhealthy"
        health_status["status"] = "degraded"
    
    try:
        # Check Redis
        redis_client = get_redis()
        await redis_client.ping()
        health_status["checks"]["redis"] = "healthy"
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        health_status["checks"]["redis"] = "unhealthy"
        health_status["status"] = "degraded"
    
    return health_status

@router.get("/ready")
async def readiness_check():
    """Readiness check for Kubernetes"""
    try:
        # Check if all required services are ready
        db = get_mongodb()
        await db.admin.command('ping')
        
        redis_client = get_redis()
        await redis_client.ping()
        
        return {"status": "ready"}
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {"status": "not_ready", "error": str(e)}
