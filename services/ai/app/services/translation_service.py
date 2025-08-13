import logging
from typing import Optional
import torch
from langdetect import detect
import googletrans
from googletrans import Translator

logger = logging.getLogger(__name__)

# Optional imports for offline models
try:
    from transformers import MarianMTModel, MarianTokenizer
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("Transformers not available, using online translation only")

class TranslationService:
    def __init__(self):
        self.translator = Translator()
        self.models = {}
        self._load_models()
    
    def _load_models(self):
        """Load translation models for offline use"""
        try:
            # Load small models for offline translation
            model_name = "Helsinki-NLP/opus-mt-en-es"
            self.models["en-es"] = {
                "tokenizer": MarianTokenizer.from_pretrained(model_name),
                "model": MarianMTModel.from_pretrained(model_name)
            }
            logger.info("Loaded offline translation models")
        except Exception as e:
            logger.warning(f"Could not load offline models: {e}")
    
    async def translate(
        self,
        text: str,
        source_lang: Optional[str] = None,
        target_lang: str = "en",
        context: Optional[str] = None
    ) -> dict:
        """Translate text using online/offline methods"""
        try:
            # Detect source language if not provided
            if not source_lang:
                source_lang = await self.detect_language(text)
            
            # Use Google Translate for online translation
            try:
                result = self.translator.translate(text, dest=target_lang, src=source_lang)
                return {
                    "originalText": text,
                    "translatedText": result.text,
                    "sourceLanguage": source_lang,
                    "targetLanguage": target_lang,
                    "confidence": 0.9,
                    "alternatives": []
                }
            except Exception as e:
                logger.warning(f"Online translation failed: {e}")
                # Fallback to offline model if available
                return await self._offline_translate(text, source_lang, target_lang)
                
        except Exception as e:
            logger.error(f"Translation error: {e}")
            raise
    
    async def detect_language(self, text: str) -> str:
        """Detect the language of the text"""
        try:
            return detect(text)
        except Exception as e:
            logger.error(f"Language detection error: {e}")
            return "unknown"
    
    async def _offline_translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> dict:
        """Offline translation using local models"""
        try:
            # Check if we have a model for this language pair
            model_key = f"{source_lang}-{target_lang}"
            if model_key in self.models:
                tokenizer = self.models[model_key]["tokenizer"]
                model = self.models[model_key]["model"]
                
                inputs = tokenizer(text, return_tensors="pt", padding=True)
                with torch.no_grad():
                    translated = model.generate(**inputs)
                translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
                
                return {
                    "originalText": text,
                    "translatedText": translated_text,
                    "sourceLanguage": source_lang,
                    "targetLanguage": target_lang,
                    "confidence": 0.7,
                    "alternatives": []
                }
            else:
                # Fallback to identity translation
                return {
                    "originalText": text,
                    "translatedText": text,
                    "sourceLanguage": source_lang,
                    "targetLanguage": target_lang,
                    "confidence": 0.0,
                    "alternatives": []
                }
        except Exception as e:
            logger.error(f"Offline translation error: {e}")
            raise
