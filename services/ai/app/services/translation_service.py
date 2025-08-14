"""
Translation service for AI Service
"""

import asyncio
import logging
from typing import Optional, Dict, Any, List
import time

# Optional imports for different translation providers
try:
    from transformers import MarianMTModel, MarianTokenizer, pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

try:
    from googletrans import Translator as GoogleTranslator
    GOOGLE_TRANSLATE_AVAILABLE = True
except ImportError:
    GOOGLE_TRANSLATE_AVAILABLE = False

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

logger = logging.getLogger(__name__)

class TranslationService:
    """Translation service with multiple provider support"""
    
    def __init__(self):
        self.google_translator = None
        self.local_models = {}
        self.language_detector = None
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize translation services"""
        try:
            # Initialize Google Translate if available
            if GOOGLE_TRANSLATE_AVAILABLE:
                self.google_translator = GoogleTranslator()
                logger.info("Google Translate initialized")
            
            # Initialize language detection
            if TRANSFORMERS_AVAILABLE:
                try:
                    self.language_detector = pipeline("text-classification", 
                                                    model="papluca/xlm-roberta-base-language-detection")
                    logger.info("Language detection model loaded")
                except Exception as e:
                    logger.warning(f"Could not load language detection model: {e}")
            
            # Load local translation models
            self._load_local_models()
            
        except Exception as e:
            logger.error(f"Failed to initialize translation services: {e}")
    
    def _load_local_models(self):
        """Load local translation models for offline use"""
        if not TRANSFORMERS_AVAILABLE:
            return
        
        try:
            # Load common language pairs
            model_pairs = [
                ("en", "es", "Helsinki-NLP/opus-mt-en-es"),
                ("en", "fr", "Helsinki-NLP/opus-mt-en-fr"),
                ("en", "de", "Helsinki-NLP/opus-mt-en-de"),
                ("es", "en", "Helsinki-NLP/opus-mt-es-en"),
                ("fr", "en", "Helsinki-NLP/opus-mt-fr-en"),
                ("de", "en", "Helsinki-NLP/opus-mt-de-en"),
            ]
            
            for source, target, model_name in model_pairs:
                try:
                    key = f"{source}-{target}"
                    self.local_models[key] = {
                        "tokenizer": MarianTokenizer.from_pretrained(model_name),
                        "model": MarianMTModel.from_pretrained(model_name)
                    }
                    logger.info(f"Loaded local model for {source} -> {target}")
                except Exception as e:
                    logger.warning(f"Could not load model {model_name}: {e}")
                    
        except Exception as e:
            logger.error(f"Failed to load local models: {e}")
    
    async def translate(
        self,
        text: str,
        source_lang: Optional[str] = None,
        target_lang: str = "en",
        context: Optional[str] = None,
        quality: str = "balanced"
    ) -> Dict[str, Any]:
        """Translate text using the best available method"""
        start_time = time.time()
        
        try:
            # Detect source language if not provided
            if not source_lang or source_lang == "auto":
                source_lang = await self.detect_language(text)
            
            # Try different translation methods in order of preference
            result = None
            
            # 1. Try OpenAI if available and high quality requested
            if quality == "high" and OPENAI_AVAILABLE and openai.api_key:
                try:
                    result = await self._openai_translate(text, source_lang, target_lang, context)
                except Exception as e:
                    logger.warning(f"OpenAI translation failed: {e}")
            
            # 2. Try Google Translate if available
            if not result and self.google_translator:
                try:
                    result = await self._google_translate(text, source_lang, target_lang)
                except Exception as e:
                    logger.warning(f"Google Translate failed: {e}")
            
            # 3. Try local models
            if not result:
                result = await self._local_translate(text, source_lang, target_lang)
            
            # 4. Fallback to identity translation
            if not result:
                result = {
                    "originalText": text,
                    "translatedText": text,
                    "sourceLanguage": source_lang,
                    "targetLanguage": target_lang,
                    "confidence": 0.1,
                    "alternatives": [],
                    "model": "fallback"
                }
            
            result["processingTime"] = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            logger.info(f"Translation completed", {
                "source_lang": source_lang,
                "target_lang": target_lang,
                "model": result.get("model"),
                "confidence": result.get("confidence"),
                "processing_time": result["processingTime"]
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            raise
    
    async def detect_language(self, text: str) -> str:
        """Detect the language of the input text"""
        try:
            # Use local language detection model if available
            if self.language_detector:
                result = self.language_detector(text)
                if result and len(result) > 0:
                    # Extract language code from model output
                    detected = result[0]['label']
                    # Convert to standard language codes
                    lang_map = {
                        'LABEL_0': 'en', 'LABEL_1': 'es', 'LABEL_2': 'fr',
                        'LABEL_3': 'de', 'LABEL_4': 'it', 'LABEL_5': 'pt'
                    }
                    return lang_map.get(detected, 'en')
            
            # Fallback to simple heuristics
            text_lower = text.lower()
            
            # Simple keyword-based detection
            if any(word in text_lower for word in ["the", "and", "is", "are", "hello", "thank", "you"]):
                return "en"
            elif any(word in text_lower for word in ["el", "la", "y", "es", "son", "hola", "gracias"]):
                return "es"
            elif any(word in text_lower for word in ["le", "la", "et", "est", "sont", "bonjour", "merci"]):
                return "fr"
            elif any(word in text_lower for word in ["der", "die", "das", "und", "ist", "sind", "hallo", "danke"]):
                return "de"
            elif any(word in text_lower for word in ["il", "la", "e", "è", "sono", "ciao", "grazie"]):
                return "it"
            else:
                return "en"  # Default fallback
                
        except Exception as e:
            logger.error(f"Language detection failed: {e}")
            return "en"  # Default fallback
    
    async def _openai_translate(
        self, 
        text: str, 
        source_lang: str, 
        target_lang: str, 
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Translate using OpenAI GPT"""
        try:
            prompt = f"Translate the following text from {source_lang} to {target_lang}"
            if context:
                prompt += f" (context: {context})"
            prompt += f":\n\n{text}\n\nTranslation:"
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional translator. Provide only the translation without explanations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            translated_text = response.choices[0].message.content.strip()
            
            return {
                "originalText": text,
                "translatedText": translated_text,
                "sourceLanguage": source_lang,
                "targetLanguage": target_lang,
                "confidence": 0.95,
                "alternatives": [],
                "model": "openai-gpt-3.5-turbo"
            }
            
        except Exception as e:
            logger.error(f"OpenAI translation failed: {e}")
            raise
    
    async def _google_translate(self, text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Translate using Google Translate"""
        try:
            result = self.google_translator.translate(text, dest=target_lang, src=source_lang)
            
            return {
                "originalText": text,
                "translatedText": result.text,
                "sourceLanguage": result.src,
                "targetLanguage": target_lang,
                "confidence": 0.90,
                "alternatives": [],
                "model": "google-translate"
            }
            
        except Exception as e:
            logger.error(f"Google Translate failed: {e}")
            raise
    
    async def _local_translate(self, text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Translate using local models"""
        try:
            model_key = f"{source_lang}-{target_lang}"
            
            if model_key in self.local_models:
                tokenizer = self.local_models[model_key]["tokenizer"]
                model = self.local_models[model_key]["model"]
                
                # Tokenize input
                inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
                
                # Generate translation
                with torch.no_grad():
                    translated = model.generate(**inputs, max_length=512, num_beams=4, early_stopping=True)
                
                # Decode output
                translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)
                
                return {
                    "originalText": text,
                    "translatedText": translated_text,
                    "sourceLanguage": source_lang,
                    "targetLanguage": target_lang,
                    "confidence": 0.80,
                    "alternatives": [],
                    "model": f"local-{model_key}"
                }
            else:
                # No local model available, return mock translation
                return {
                    "originalText": text,
                    "translatedText": f"[{target_lang.upper()}] {text}",
                    "sourceLanguage": source_lang,
                    "targetLanguage": target_lang,
                    "confidence": 0.50,
                    "alternatives": [],
                    "model": "mock-local"
                }
                
        except Exception as e:
            logger.error(f"Local translation failed: {e}")
            raise
    
    async def batch_translate(
        self,
        texts: List[str],
        source_lang: str,
        target_lang: str,
        quality: str = "balanced"
    ) -> Dict[str, Any]:
        """Translate multiple texts in batch"""
        start_time = time.time()
        
        try:
            translations = []
            
            # Process each text
            for text in texts:
                result = await self.translate(text, source_lang, target_lang, quality=quality)
                translations.append(result)
            
            total_time = (time.time() - start_time) * 1000
            
            return {
                "translations": translations,
                "total_processing_time": total_time,
                "success_count": len(translations),
                "error_count": 0
            }
            
        except Exception as e:
            logger.error(f"Batch translation failed: {e}")
            raise
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported languages"""
        return [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "es", "name": "Spanish", "native_name": "Español"},
            {"code": "fr", "name": "French", "native_name": "Français"},
            {"code": "de", "name": "German", "native_name": "Deutsch"},
            {"code": "it", "name": "Italian", "native_name": "Italiano"},
            {"code": "pt", "name": "Portuguese", "native_name": "Português"},
            {"code": "ru", "name": "Russian", "native_name": "Русский"},
            {"code": "ja", "name": "Japanese", "native_name": "日本語"},
            {"code": "ko", "name": "Korean", "native_name": "한국어"},
            {"code": "zh", "name": "Chinese", "native_name": "中文"},
            {"code": "ar", "name": "Arabic", "native_name": "العربية"},
            {"code": "hi", "name": "Hindi", "native_name": "हिन्दी"},
            {"code": "tr", "name": "Turkish", "native_name": "Türkçe"},
            {"code": "nl", "name": "Dutch", "native_name": "Nederlands"},
            {"code": "pl", "name": "Polish", "native_name": "Polski"},
        ]
    
    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available translation models"""
        models = []
        
        if OPENAI_AVAILABLE and openai.api_key:
            models.append({
                "id": "openai-gpt-3.5-turbo",
                "name": "OpenAI GPT-3.5 Turbo",
                "type": "neural",
                "provider": "openai",
                "quality": "high",
                "speed": "medium",
                "languages": "all"
            })
        
        if GOOGLE_TRANSLATE_AVAILABLE:
            models.append({
                "id": "google-translate",
                "name": "Google Translate",
                "type": "neural",
                "provider": "google",
                "quality": "high",
                "speed": "fast",
                "languages": "100+"
            })
        
        if TRANSFORMERS_AVAILABLE and self.local_models:
            for key in self.local_models.keys():
                source, target = key.split("-")
                models.append({
                    "id": f"local-{key}",
                    "name": f"Local {source.upper()}-{target.upper()}",
                    "type": "neural",
                    "provider": "local",
                    "quality": "medium",
                    "speed": "fast",
                    "languages": f"{source}, {target}"
                })
        
        return models

# Global translation service instance
translation_service = TranslationService()