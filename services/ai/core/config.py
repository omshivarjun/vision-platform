import os
from typing import Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    # API Settings
    API_TITLE: str = "Multimodal AI Service"
    API_DESCRIPTION: str = "AI microservice for translation and accessibility features"
    API_VERSION: str = "1.0.0"
    
    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Model Settings
    MODEL_CACHE_DIR: str = "./models"
    MAX_TEXT_LENGTH: int = 1000
    
    # OCR Settings
    OCR_LANGUAGES: list = ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
