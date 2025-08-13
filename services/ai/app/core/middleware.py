"""
Middleware for AI Service
"""

import time
import uuid
from typing import Callable
from fastapi import Request, Response
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Log request start
        start_time = time.time()
        logger.info(
            f"Request started - ID: {request_id}, Method: {request.method}, "
            f"Path: {request.url.path}, Client: {request.client.host if request.client else 'unknown'}"
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Log request completion
            process_time = time.time() - start_time
            logger.info(
                f"Request completed - ID: {request_id}, Status: {response.status_code}, "
                f"Duration: {process_time:.3f}s"
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            # Log request error
            process_time = time.time() - start_time
            logger.error(
                f"Request failed - ID: {request_id}, Error: {str(e)}, "
                f"Duration: {process_time:.3f}s"
            )
            raise
