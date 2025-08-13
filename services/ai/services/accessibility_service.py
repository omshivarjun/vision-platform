import logging
import asyncio
from typing import List, Dict, Any, Tuple
import numpy as np
from PIL import Image
import io

logger = logging.getLogger(__name__)

class AccessibilityService:
    """Service for accessibility features including scene description, object detection, and navigation assistance"""
    
    def __init__(self):
        self.scene_model = None
        self.object_detection_model = None
        self.navigation_service = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize AI models for accessibility features"""
        try:
            # Initialize scene description model (mock)
            self.scene_model = MockSceneModel()
            
            # Initialize object detection model (mock)
            self.object_detection_model = MockObjectDetectionModel()
            
            # Initialize navigation service (mock)
            self.navigation_service = MockNavigationService()
            
            logger.info("Accessibility models initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize accessibility models: {e}")
            raise
    
    async def describe_scene(self, image_data: bytes, detail_level: str = "medium") -> Dict[str, Any]:
        """Generate natural language description of a scene"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Generate scene description
            description = await self.scene_model.describe(image, detail_level)
            
            # Detect objects in the scene
            objects = await self.object_detection_model.detect(image, confidence_threshold=0.3)
            
            return {
                "description": description["text"],
                "objects_detected": objects["objects"],
                "confidence": description["confidence"],
                "detail_level": detail_level,
                "model_used": self.scene_model.name,
                "processing_time": description.get("processing_time", 0)
            }
            
        except Exception as e:
            logger.error(f"Scene description failed: {e}")
            raise
    
    async def detect_objects(self, image_data: bytes, confidence_threshold: float = 0.5) -> Dict[str, Any]:
        """Detect and classify objects in an image"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Detect objects
            result = await self.object_detection_model.detect(image, confidence_threshold)
            
            return {
                "objects": result["objects"],
                "confidence_threshold": confidence_threshold,
                "total_objects": len(result["objects"]),
                "model_used": self.object_detection_model.name,
                "processing_time": result.get("processing_time", 0)
            }
            
        except Exception as e:
            logger.error(f"Object detection failed: {e}")
            raise
    
    async def get_navigation(
        self, 
        current_location: Dict[str, float], 
        destination: str, 
        accessibility_mode: str = "walking"
    ) -> Dict[str, Any]:
        """Provide navigation assistance with accessibility considerations"""
        try:
            # Get navigation route
            route = await self.navigation_service.get_route(
                current_location, 
                destination, 
                accessibility_mode
            )
            
            return {
                "route": route["waypoints"],
                "total_distance": route["distance"],
                "estimated_time": route["duration"],
                "accessibility_mode": accessibility_mode,
                "hazards": route.get("hazards", []),
                "safe_paths": route.get("safe_paths", []),
                "voice_instructions": route.get("instructions", [])
            }
            
        except Exception as e:
            logger.error(f"Navigation assistance failed: {e}")
            raise
    
    async def detect_obstacles(self, image_data: bytes) -> Dict[str, Any]:
        """Detect obstacles and hazards in the user's path"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Detect objects that could be obstacles
            objects = await self.object_detection_model.detect(image, confidence_threshold=0.4)
            
            # Classify obstacles by type and severity
            obstacles = []
            for obj in objects["objects"]:
                if self._is_obstacle(obj["name"]):
                    obstacle = {
                        "type": obj["name"],
                        "distance": self._estimate_distance(obj["bbox"]),
                        "direction": self._get_direction(obj["bbox"]),
                        "severity": self._assess_severity(obj["name"], obj["bbox"]),
                        "confidence": obj["confidence"]
                    }
                    obstacles.append(obstacle)
            
            return {
                "obstacles": obstacles,
                "total_obstacles": len(obstacles),
                "safety_level": self._assess_overall_safety(obstacles)
            }
            
        except Exception as e:
            logger.error(f"Obstacle detection failed: {e}")
            raise
    
    async def generate_voice_instruction(self, instruction: str, verbosity: str = "medium") -> Dict[str, Any]:
        """Generate voice-friendly navigation instructions"""
        try:
            # Adjust instruction based on verbosity level
            if verbosity == "low":
                text = self._simplify_instruction(instruction)
            elif verbosity == "high":
                text = self._elaborate_instruction(instruction)
            else:
                text = instruction
            
            # Estimate speech duration
            words = len(text.split())
            estimated_duration = words * 0.6  # Approximate 100 words per minute
            
            return {
                "text": text,
                "verbosity": verbosity,
                "estimated_duration": estimated_duration,
                "word_count": words
            }
            
        except Exception as e:
            logger.error(f"Voice instruction generation failed: {e}")
            raise
    
    async def generate_safety_warnings(self, obstacles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate safety warnings based on detected obstacles"""
        warnings = []
        
        for obstacle in obstacles:
            if obstacle["severity"] == "high":
                priority = "high"
                message = f"Warning: {obstacle['type']} directly ahead at {obstacle['distance']:.1f} meters"
            elif obstacle["severity"] == "medium":
                priority = "medium"
                message = f"Caution: {obstacle['type']} {obstacle['direction']} at {obstacle['distance']:.1f} meters"
            else:
                priority = "low"
                message = f"Note: {obstacle['type']} detected {obstacle['direction']}"
            
            warnings.append({
                "message": message,
                "priority": priority,
                "obstacle_type": obstacle["type"],
                "distance": obstacle["distance"],
                "direction": obstacle["direction"]
            })
        
        # Sort by priority and distance
        warnings.sort(key=lambda x: (
            {"high": 0, "medium": 1, "low": 2}[x["priority"]], 
            x["distance"]
        ))
        
        return warnings
    
    def _is_obstacle(self, object_name: str) -> bool:
        """Determine if an object is considered an obstacle"""
        obstacles = {
            "person", "car", "bicycle", "motorcycle", "bus", "truck",
            "pole", "tree", "bench", "barrier", "construction",
            "stairs", "curb", "pothole", "debris"
        }
        return object_name.lower() in obstacles
    
    def _estimate_distance(self, bbox: List[float]) -> float:
        """Estimate distance to object based on bounding box size"""
        # Simple heuristic: larger objects are closer
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        area = width * height
        
        # Mock distance calculation (would use depth estimation in real implementation)
        if area > 10000:
            return 0.5  # Very close
        elif area > 5000:
            return 1.5  # Close
        elif area > 1000:
            return 3.0  # Medium distance
        else:
            return 5.0  # Far
    
    def _get_direction(self, bbox: List[float]) -> str:
        """Get direction of object relative to center of image"""
        center_x = (bbox[0] + bbox[2]) / 2
        image_center = 320  # Assume 640px width
        
        if center_x < image_center - 100:
            return "left"
        elif center_x > image_center + 100:
            return "right"
        else:
            return "ahead"
    
    def _assess_severity(self, object_name: str, bbox: List[float]) -> str:
        """Assess severity of obstacle"""
        distance = self._estimate_distance(bbox)
        
        high_risk_objects = {"car", "truck", "bus", "stairs", "pothole"}
        medium_risk_objects = {"person", "bicycle", "pole", "barrier"}
        
        if object_name.lower() in high_risk_objects:
            if distance < 2.0:
                return "high"
            elif distance < 4.0:
                return "medium"
            else:
                return "low"
        elif object_name.lower() in medium_risk_objects:
            if distance < 1.0:
                return "high"
            elif distance < 3.0:
                return "medium"
            else:
                return "low"
        else:
            return "low"
    
    def _assess_overall_safety(self, obstacles: List[Dict[str, Any]]) -> str:
        """Assess overall safety level based on all obstacles"""
        if not obstacles:
            return "safe"
        
        high_severity_count = sum(1 for obs in obstacles if obs["severity"] == "high")
        medium_severity_count = sum(1 for obs in obstacles if obs["severity"] == "medium")
        
        if high_severity_count > 0:
            return "dangerous"
        elif medium_severity_count > 2:
            return "caution"
        elif medium_severity_count > 0:
            return "moderate"
        else:
            return "safe"
    
    def _simplify_instruction(self, instruction: str) -> str:
        """Simplify instruction for low verbosity"""
        # Remove unnecessary words and details
        simplified = instruction.replace("in approximately", "in")
        simplified = simplified.replace("continue straight ahead", "go straight")
        simplified = simplified.replace("turn to the right", "turn right")
        simplified = simplified.replace("turn to the left", "turn left")
        return simplified
    
    def _elaborate_instruction(self, instruction: str) -> str:
        """Elaborate instruction for high verbosity"""
        # Add safety and context information
        if "turn" in instruction.lower():
            return f"{instruction}. Please check for traffic and obstacles before turning."
        elif "cross" in instruction.lower():
            return f"{instruction}. Listen for traffic and use crosswalk signals if available."
        elif "stairs" in instruction.lower():
            return f"{instruction}. Please use handrails and take your time on the stairs."
        else:
            return f"{instruction}. Stay alert for obstacles and other pedestrians."


class MockSceneModel:
    """Mock scene description model for development"""
    
    def __init__(self):
        self.name = "mock-scene-model"
    
    async def describe(self, image: Image.Image, detail_level: str) -> Dict[str, Any]:
        """Generate mock scene description"""
        await asyncio.sleep(0.1)  # Simulate processing time
        
        descriptions = {
            "low": "A room with furniture and objects.",
            "medium": "A modern living room with a comfortable sofa, coffee table, and large windows providing natural light.",
            "high": "A contemporary living room featuring a plush gray sectional sofa with decorative pillows, a wooden coffee table with a glass vase containing fresh flowers, floor-to-ceiling windows with sheer white curtains allowing abundant natural light, hardwood flooring, and modern wall art creating a warm and inviting atmosphere."
        }
        
        return {
            "text": descriptions.get(detail_level, descriptions["medium"]),
            "confidence": 0.85,
            "processing_time": 0.1
        }


class MockObjectDetectionModel:
    """Mock object detection model for development"""
    
    def __init__(self):
        self.name = "mock-object-detection-model"
    
    async def detect(self, image: Image.Image, confidence_threshold: float) -> Dict[str, Any]:
        """Generate mock object detection results"""
        await asyncio.sleep(0.2)  # Simulate processing time
        
        # Mock objects with varying confidence levels
        all_objects = [
            {"name": "sofa", "confidence": 0.95, "bbox": [50, 100, 300, 250]},
            {"name": "coffee table", "confidence": 0.87, "bbox": [150, 200, 250, 280]},
            {"name": "window", "confidence": 0.92, "bbox": [400, 50, 600, 300]},
            {"name": "person", "confidence": 0.78, "bbox": [100, 80, 180, 350]},
            {"name": "plant", "confidence": 0.65, "bbox": [320, 150, 380, 280]},
            {"name": "book", "confidence": 0.45, "bbox": [200, 220, 230, 240]}
        ]
        
        # Filter by confidence threshold
        filtered_objects = [
            obj for obj in all_objects 
            if obj["confidence"] >= confidence_threshold
        ]
        
        return {
            "objects": filtered_objects,
            "processing_time": 0.2
        }


class MockNavigationService:
    """Mock navigation service for development"""
    
    def __init__(self):
        self.name = "mock-navigation-service"
    
    async def get_route(
        self, 
        current_location: Dict[str, float], 
        destination: str, 
        accessibility_mode: str
    ) -> Dict[str, Any]:
        """Generate mock navigation route"""
        await asyncio.sleep(0.3)  # Simulate processing time
        
        # Mock waypoints
        waypoints = [
            {
                "lat": current_location["latitude"],
                "lng": current_location["longitude"],
                "instruction": "Starting point"
            },
            {
                "lat": current_location["latitude"] + 0.001,
                "lng": current_location["longitude"],
                "instruction": "Head north for 100 meters"
            },
            {
                "lat": current_location["latitude"] + 0.001,
                "lng": current_location["longitude"] + 0.001,
                "instruction": "Turn right and continue for 50 meters"
            },
            {
                "lat": current_location["latitude"] + 0.002,
                "lng": current_location["longitude"] + 0.001,
                "instruction": f"Arrive at {destination}"
            }
        ]
        
        # Mock hazards and safe paths based on accessibility mode
        hazards = []
        safe_paths = []
        
        if accessibility_mode == "wheelchair":
            hazards = [
                {"type": "stairs", "location": "ahead", "distance": 50}
            ]
            safe_paths = [
                {"type": "ramp", "location": "left", "distance": 30}
            ]
        elif accessibility_mode == "visual":
            hazards = [
                {"type": "construction", "location": "right", "distance": 75},
                {"type": "uneven_surface", "location": "ahead", "distance": 120}
            ]
            safe_paths = [
                {"type": "sidewalk", "location": "left", "distance": 0},
                {"type": "crosswalk", "location": "ahead", "distance": 200}
            ]
        
        return {
            "waypoints": waypoints,
            "distance": "200 meters",
            "duration": "3 minutes",
            "hazards": hazards,
            "safe_paths": safe_paths,
            "instructions": [wp["instruction"] for wp in waypoints]
        }