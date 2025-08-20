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
    
    # AI Service Configuration - FIXED
    DEFAULT_TRANSLATION_PROVIDER: str = Field(default="huggingface", env="DEFAULT_TRANSLATION_PROVIDER")
    ENABLE_FUNCTION_CALLING: bool = Field(default=False, env="ENABLE_FUNCTION_CALLING")
    TRANSLATION_CACHE_TTL: int = Field(default=3600, env="TRANSLATION_CACHE_TTL")
    MAX_TRANSLATION_LENGTH: int = Field(default=5000, env="MAX_TRANSLATION_LENGTH")
    
    # GEMINI Configuration
    GOOGLE_API_KEY: Optional[str] = Field(default=None, env="GOOGLE_API_KEY")
    GEMINI_MODEL: str = Field(default="gemini-2.5-pro", env="GEMINI_MODEL")
    GEMINI_MAX_TOKENS: int = Field(default=8192, env="GEMINI_MAX_TOKENS")
    ENABLE_GEMINI_FUNCTION_CALLING: bool = Field(default=False, env="ENABLE_GEMINI_FUNCTION_CALLING")
    
    # OCR Settings
    OCR_LANGUAGES: List[str] = Field(
        default=["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"],
        env="OCR_LANGUAGES"
    )
    
    # API Keys
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    GOOGLE_CLOUD_CREDENTIALS: Optional[str] = Field(default=None, env="GOOGLE_CLOUD_CREDENTIALS")
    HUGGINGFACE_API_KEY: Optional[str] = Field(default=None, env="HUGGINGFACE_API_KEY")
    
    # Google Cloud Platform (GCP) Configuration
    GOOGLE_CLOUD_PROJECT: Optional[str] = Field(default=None, env="GOOGLE_CLOUD_PROJECT")
    GOOGLE_CLOUD_CREDENTIALS: Optional[str] = Field(default=None, env="GOOGLE_CLOUD_CREDENTIALS")
    GOOGLE_CLOUD_STORAGE_BUCKET: str = Field(default="vision-platform-files", env="GOOGLE_CLOUD_STORAGE_BUCKET")
    GOOGLE_CLOUD_REGION: str = Field(default="us-central1", env="GOOGLE_CLOUD_REGION")
    GOOGLE_CLOUD_ZONE: str = Field(default="us-central1-a", env="GOOGLE_CLOUD_ZONE")
    
    # Test Configuration
    TEST_MONGODB_URI: Optional[str] = Field(default=None, env="TEST_MONGODB_URI")
    TEST_REDIS_URL: Optional[str] = Field(default=None, env="TEST_REDIS_URL")
    TEST_TIMEOUT: int = Field(default=10000, env="TEST_TIMEOUT")
    E2E_TIMEOUT: int = Field(default=30000, env="E2E_TIMEOUT")
    
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
