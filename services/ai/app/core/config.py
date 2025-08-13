import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application Settings
    APP_NAME: str = "Vision Platform AI Service"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", env="NODE_ENV")
    DEBUG: bool = Field(default=True, env="DEBUG")
    
    # Server Settings
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # CORS Settings
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:19006"],
        env="CORS_ORIGINS"
    )
    ALLOWED_HOSTS: List[str] = Field(
        default=["*"],
        env="ALLOWED_HOSTS"
    )
    
    # Database Settings
    MONGODB_URI: str = Field(
        default="mongodb://admin:password123@localhost:27017/vision_platform?authSource=admin",
        env="MONGODB_URI"
    )
    REDIS_URL: str = Field(
        default="redis://localhost:6379",
        env="REDIS_URL"
    )
    
    # AI Model Settings
    MODEL_CACHE_DIR: str = Field(default="./models", env="MODEL_CACHE_DIR")
    MAX_TEXT_LENGTH: int = Field(default=1000, env="MAX_TEXT_LENGTH")
    ENABLE_GPU: bool = Field(default=False, env="ENABLE_GPU")
    
    # OCR Settings
    OCR_LANGUAGES: List[str] = Field(
        default=["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"],
        env="OCR_LANGUAGES"
    )
    
    # API Keys
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    GOOGLE_CLOUD_CREDENTIALS: Optional[str] = Field(default=None, env="GOOGLE_CLOUD_CREDENTIALS")
    HUGGINGFACE_API_KEY: Optional[str] = Field(default=None, env="HUGGINGFACE_API_KEY")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")
    
    # File Upload Settings
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    UPLOAD_DIR: str = Field(default="./uploads", env="UPLOAD_DIR")
    
    # Rate Limiting
    RATE_LIMIT_WINDOW_MS: int = Field(default=900000, env="RATE_LIMIT_WINDOW_MS")  # 15 minutes
    RATE_LIMIT_MAX_REQUESTS: int = Field(default=100, env="RATE_LIMIT_MAX_REQUESTS")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
