"""
Speech service for AI Service
"""

import asyncio
import logging
import io
import tempfile
import os
from typing import Dict, Any, Optional, List
import time

# Optional imports for different speech providers
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False

try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False

try:
    import pydub
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False

logger = logging.getLogger(__name__)

class SpeechService:
    """Speech service for STT and TTS functionality"""
    
    def __init__(self):
        self.whisper_model = None
        self.speech_recognizer = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize speech processing models"""
        try:
            # Initialize Whisper for STT if available
            if WHISPER_AVAILABLE:
                try:
                    self.whisper_model = whisper.load_model("base")
                    logger.info("Whisper model loaded for speech-to-text")
                except Exception as e:
                    logger.warning(f"Could not load Whisper model: {e}")
            
            # Initialize SpeechRecognition as fallback
            if SPEECH_RECOGNITION_AVAILABLE:
                self.speech_recognizer = sr.Recognizer()
                logger.info("SpeechRecognition initialized")
                
        except Exception as e:
            logger.error(f"Failed to initialize speech models: {e}")
    
    async def speech_to_text(
        self,
        audio_data: bytes,
        language: str = "en",
        model: str = "whisper",
        timestamping: bool = False
    ) -> Dict[str, Any]:
        """Convert speech audio to text"""
        start_time = time.time()
        
        try:
            # Save audio data to temporary file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                result = None
                
                # Try Whisper first if available
                if model == "whisper" and self.whisper_model:
                    result = await self._whisper_transcribe(temp_file_path, language, timestamping)
                
                # Fallback to SpeechRecognition
                elif self.speech_recognizer and PYDUB_AVAILABLE:
                    result = await self._speech_recognition_transcribe(temp_file_path, language)
                
                # Mock transcription as last resort
                if not result:
                    result = await self._mock_transcribe(audio_data, language)
                
                result["processingTime"] = (time.time() - start_time) * 1000
                
                logger.info(f"Speech-to-text completed", {
                    "language": language,
                    "model": model,
                    "text_length": len(result.get("text", "")),
                    "confidence": result.get("confidence"),
                    "processing_time": result["processingTime"]
                })
                
                return result
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logger.error(f"Speech-to-text failed: {e}")
            raise
    
    async def text_to_speech(
        self,
        text: str,
        language: str = "en",
        voice: str = "default",
        speed: float = 1.0,
        pitch: float = 1.0,
        volume: float = 1.0
    ) -> Dict[str, Any]:
        """Convert text to speech audio"""
        start_time = time.time()
        
        try:
            # Use gTTS if available
            if GTTS_AVAILABLE:
                result = await self._gtts_synthesize(text, language, speed)
            else:
                # Mock TTS
                result = await self._mock_tts(text, language, voice, speed, pitch, volume)
            
            result["processingTime"] = (time.time() - start_time) * 1000
            
            logger.info(f"Text-to-speech completed", {
                "language": language,
                "voice": voice,
                "text_length": len(text),
                "duration": result.get("duration"),
                "processing_time": result["processingTime"]
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Text-to-speech failed: {e}")
            raise
    
    async def _whisper_transcribe(
        self, 
        audio_file_path: str, 
        language: str, 
        timestamping: bool
    ) -> Dict[str, Any]:
        """Transcribe audio using Whisper"""
        try:
            # Transcribe with Whisper
            result = self.whisper_model.transcribe(
                audio_file_path,
                language=language if language != "auto" else None,
                word_timestamps=timestamping
            )
            
            response = {
                "id": str(int(time.time() * 1000)),
                "text": result["text"].strip(),
                "language": result.get("language", language),
                "confidence": 0.90,  # Whisper doesn't provide confidence scores
                "model": "whisper"
            }
            
            # Add segments if timestamping is enabled
            if timestamping and "segments" in result:
                response["segments"] = [
                    {
                        "text": segment["text"],
                        "start": segment["start"],
                        "end": segment["end"],
                        "confidence": 0.90
                    }
                    for segment in result["segments"]
                ]
            
            return response
            
        except Exception as e:
            logger.error(f"Whisper transcription failed: {e}")
            raise
    
    async def _speech_recognition_transcribe(self, audio_file_path: str, language: str) -> Dict[str, Any]:
        """Transcribe audio using SpeechRecognition library"""
        try:
            # Convert audio to WAV format if needed
            audio = AudioSegment.from_file(audio_file_path)
            wav_path = audio_file_path.replace(os.path.splitext(audio_file_path)[1], ".wav")
            audio.export(wav_path, format="wav")
            
            # Transcribe using Google Speech Recognition
            with sr.AudioFile(wav_path) as source:
                audio_data = self.speech_recognizer.record(source)
                text = self.speech_recognizer.recognize_google(audio_data, language=language)
            
            # Clean up WAV file
            if os.path.exists(wav_path) and wav_path != audio_file_path:
                os.unlink(wav_path)
            
            return {
                "id": str(int(time.time() * 1000)),
                "text": text,
                "language": language,
                "confidence": 0.85,
                "model": "google-speech-recognition"
            }
            
        except Exception as e:
            logger.error(f"SpeechRecognition transcription failed: {e}")
            raise
    
    async def _mock_transcribe(self, audio_data: bytes, language: str) -> Dict[str, Any]:
        """Mock transcription for development"""
        await asyncio.sleep(1.0)  # Simulate processing time
        
        # Generate mock transcription based on audio length
        audio_length = len(audio_data)
        
        if audio_length < 50000:  # Short audio
            mock_text = "Hello, this is a short audio message."
        elif audio_length < 200000:  # Medium audio
            mock_text = "This is a medium length audio recording with multiple sentences and some content."
        else:  # Long audio
            mock_text = "This is a longer audio recording that contains multiple sentences, various topics, and extended content that would typically be found in longer speech samples."
        
        return {
            "id": str(int(time.time() * 1000)),
            "text": mock_text,
            "language": language,
            "confidence": 0.75,
            "model": "mock-stt"
        }
    
    async def _gtts_synthesize(self, text: str, language: str, speed: float) -> Dict[str, Any]:
        """Synthesize speech using gTTS"""
        try:
            # Create gTTS object
            tts = gTTS(text=text, lang=language, slow=(speed < 1.0))
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                tts.save(temp_file.name)
                
                # Calculate duration (rough estimate)
                word_count = len(text.split())
                duration = word_count * (60 / 150) / speed  # Assume 150 WPM base rate
                
                # In a real implementation, you would upload this to S3 or serve it directly
                audio_url = f"/audio/generated_{int(time.time())}.mp3"
                
                return {
                    "id": str(int(time.time() * 1000)),
                    "audioUrl": audio_url,
                    "duration": duration,
                    "format": "mp3",
                    "language": language,
                    "voice": "default",
                    "model": "gtts"
                }
                
        except Exception as e:
            logger.error(f"gTTS synthesis failed: {e}")
            raise
    
    async def _mock_tts(
        self, 
        text: str, 
        language: str, 
        voice: str, 
        speed: float, 
        pitch: float, 
        volume: float
    ) -> Dict[str, Any]:
        """Mock TTS for development"""
        await asyncio.sleep(0.5)  # Simulate processing time
        
        # Calculate estimated duration
        word_count = len(text.split())
        duration = word_count * (60 / 150) / speed  # Assume 150 WPM base rate
        
        return {
            "id": str(int(time.time() * 1000)),
            "audioUrl": f"/audio/mock_{int(time.time())}.mp3",
            "duration": duration,
            "format": "mp3",
            "language": language,
            "voice": voice,
            "model": "mock-tts"
        }
    
    async def process_voice_command(
        self,
        audio_data: bytes,
        context: Optional[str] = None,
        expected_commands: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Process voice commands for accessibility features"""
        start_time = time.time()
        
        try:
            # First transcribe the audio
            transcription_result = await self.speech_to_text(audio_data, "en", "whisper")
            command_text = transcription_result["text"].lower()
            
            # Parse command
            command_info = self._parse_voice_command(command_text, context, expected_commands)
            
            result = {
                "id": str(int(time.time() * 1000)),
                "transcription": transcription_result["text"],
                "command": command_info["command"],
                "confidence": min(transcription_result["confidence"], command_info["confidence"]),
                "parameters": command_info["parameters"],
                "action": command_info["action"],
                "processingTime": (time.time() - start_time) * 1000,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            
            logger.info(f"Voice command processed", {
                "command": command_info["command"],
                "confidence": result["confidence"],
                "processing_time": result["processingTime"]
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Voice command processing failed: {e}")
            raise
    
    def _parse_voice_command(
        self, 
        command_text: str, 
        context: Optional[str] = None,
        expected_commands: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Parse voice command and extract intent"""
        try:
            command_text = command_text.lower().strip()
            
            # Define command patterns
            command_patterns = {
                "translate": {
                    "keywords": ["translate", "translation", "convert"],
                    "action": "start_translation",
                    "confidence": 0.9
                },
                "describe": {
                    "keywords": ["describe", "what do you see", "scene", "tell me about"],
                    "action": "describe_scene",
                    "confidence": 0.9
                },
                "navigate": {
                    "keywords": ["navigate", "directions", "go to", "take me to", "find"],
                    "action": "start_navigation",
                    "confidence": 0.9
                },
                "read": {
                    "keywords": ["read", "read text", "what does it say", "ocr"],
                    "action": "read_text",
                    "confidence": 0.9
                },
                "help": {
                    "keywords": ["help", "what can you do", "commands", "assistance"],
                    "action": "show_help",
                    "confidence": 0.8
                },
                "settings": {
                    "keywords": ["settings", "preferences", "configure", "adjust"],
                    "action": "open_settings",
                    "confidence": 0.8
                },
                "stop": {
                    "keywords": ["stop", "cancel", "quit", "exit"],
                    "action": "stop_current_action",
                    "confidence": 0.9
                }
            }
            
            # Find matching command
            best_match = None
            best_confidence = 0
            
            for command, pattern in command_patterns.items():
                for keyword in pattern["keywords"]:
                    if keyword in command_text:
                        confidence = pattern["confidence"]
                        # Boost confidence for exact matches
                        if command_text.strip() == keyword:
                            confidence += 0.05
                        
                        if confidence > best_confidence:
                            best_match = command
                            best_confidence = confidence
                            break
            
            # Extract parameters based on command
            parameters = {}
            if best_match == "navigate":
                # Extract destination
                navigate_keywords = ["go to", "take me to", "navigate to", "find"]
                for keyword in navigate_keywords:
                    if keyword in command_text:
                        destination = command_text.split(keyword, 1)[1].strip()
                        if destination:
                            parameters["destination"] = destination
                        break
            
            elif best_match == "translate":
                # Extract text to translate
                translate_keywords = ["translate", "convert"]
                for keyword in translate_keywords:
                    if keyword in command_text:
                        text_to_translate = command_text.split(keyword, 1)[1].strip()
                        if text_to_translate:
                            parameters["text"] = text_to_translate
                        break
            
            # Return command information
            if best_match:
                return {
                    "command": best_match,
                    "confidence": best_confidence,
                    "parameters": parameters,
                    "action": command_patterns[best_match]["action"]
                }
            else:
                return {
                    "command": "unknown",
                    "confidence": 0.3,
                    "parameters": {},
                    "action": "unknown_command"
                }
                
        except Exception as e:
            logger.error(f"Voice command parsing failed: {e}")
            return {
                "command": "error",
                "confidence": 0.0,
                "parameters": {},
                "action": "error"
            }
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported speech languages"""
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
            {"code": "zh", "name": "Chinese", "native_name": "中文"}
        ]
    
    def get_available_voices(self) -> List[Dict[str, Any]]:
        """Get list of available voices"""
        return [
            {
                "id": "default",
                "name": "Default Voice",
                "language": "en",
                "gender": "neutral",
                "description": "Standard voice for general use"
            },
            {
                "id": "female_1",
                "name": "Female Voice 1",
                "language": "en",
                "gender": "female",
                "description": "Clear female voice"
            },
            {
                "id": "male_1",
                "name": "Male Voice 1",
                "language": "en",
                "gender": "male",
                "description": "Clear male voice"
            }
        ]

# Global speech service instance
speech_service = SpeechService()