"""
Accessibility service for AI Service
"""

import asyncio
import logging
import io
from typing import List, Dict, Any, Optional, Tuple
import time
from PIL import Image
import numpy as np

# Optional imports for different AI providers
try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

logger = logging.getLogger(__name__)

class AccessibilityService:
    """Service for accessibility features including scene description, object detection, and navigation assistance"""
    
    def __init__(self):
        self.object_detection_model = None
        self.scene_description_model = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize AI models for accessibility features"""
        try:
            # Initialize YOLO for object detection if available
            if YOLO_AVAILABLE:
                try:
                    self.object_detection_model = YOLO('yolov8n.pt')  # Nano model for speed
                    logger.info("YOLO object detection model loaded")
                except Exception as e:
                    logger.warning(f"Could not load YOLO model: {e}")
            
            logger.info("Accessibility models initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize accessibility models: {e}")
    
    async def describe_scene(
        self, 
        image_data: bytes, 
        detail_level: str = "detailed",
        include_objects: bool = True,
        include_text: bool = True
    ) -> Dict[str, Any]:
        """Generate natural language description of a scene"""
        start_time = time.time()
        
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Detect objects if requested
            objects = []
            if include_objects:
                object_result = await self.detect_objects(image_data, confidence_threshold=0.3)
                objects = object_result.get("objects", [])
            
            # Generate scene description
            description = await self._generate_scene_description(image, objects, detail_level)
            
            # Extract text if requested
            text_elements = []
            if include_text:
                # Use OCR service to extract text
                from .ocr_service import ocr_service
                ocr_result = await ocr_service.extract_text(image_data)
                if ocr_result.get("text"):
                    text_elements = ocr_result.get("blocks", [])
            
            result = {
                "id": str(int(time.time() * 1000)),
                "description": description,
                "objects": objects,
                "textElements": text_elements,
                "confidence": 0.85,
                "detailLevel": detail_level,
                "processingTime": (time.time() - start_time) * 1000,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            
            logger.info(f"Scene description completed", {
                "detail_level": detail_level,
                "objects_count": len(objects),
                "text_elements_count": len(text_elements),
                "processing_time": result["processingTime"]
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Scene description failed: {e}")
            raise
    
    async def detect_objects(
        self, 
        image_data: bytes, 
        confidence_threshold: float = 0.7,
        max_objects: int = 20
    ) -> Dict[str, Any]:
        """Detect and classify objects in an image"""
        start_time = time.time()
        
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            objects = []
            
            if self.object_detection_model and YOLO_AVAILABLE:
                # Use YOLO for object detection
                results = self.object_detection_model(image)
                
                for result in results:
                    boxes = result.boxes
                    if boxes is not None:
                        for box in boxes:
                            confidence = float(box.conf[0])
                            if confidence >= confidence_threshold:
                                # Get class name
                                class_id = int(box.cls[0])
                                class_name = self.object_detection_model.names[class_id]
                                
                                # Get bounding box coordinates
                                x1, y1, x2, y2 = box.xyxy[0].tolist()
                                
                                objects.append({
                                    "name": class_name,
                                    "confidence": confidence,
                                    "boundingBox": {
                                        "x": int(x1),
                                        "y": int(y1),
                                        "width": int(x2 - x1),
                                        "height": int(y2 - y1)
                                    },
                                    "category": self._get_object_category(class_name),
                                    "distance": self._estimate_distance(x1, y1, x2, y2, image.size)
                                })
            else:
                # Mock object detection
                objects = await self._mock_object_detection(image, confidence_threshold)
            
            # Sort by confidence and limit results
            objects.sort(key=lambda x: x["confidence"], reverse=True)
            objects = objects[:max_objects]
            
            result = {
                "id": str(int(time.time() * 1000)),
                "objects": objects,
                "totalObjects": len(objects),
                "confidenceThreshold": confidence_threshold,
                "processingTime": (time.time() - start_time) * 1000,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            
            logger.info(f"Object detection completed", {
                "objects_detected": len(objects),
                "confidence_threshold": confidence_threshold,
                "processing_time": result["processingTime"]
            })
            
            return result
            
        except Exception as e:
            logger.error(f"Object detection failed: {e}")
            raise
    
    async def _generate_scene_description(
        self, 
        image: Image.Image, 
        objects: List[Dict[str, Any]], 
        detail_level: str
    ) -> str:
        """Generate natural language scene description"""
        try:
            # Use OpenAI for high-quality descriptions if available
            if OPENAI_AVAILABLE and openai.api_key and detail_level == "comprehensive":
                return await self._openai_scene_description(image, objects)
            
            # Generate description based on detected objects
            if objects:
                object_names = [obj["name"] for obj in objects[:10]]  # Top 10 objects
                object_counts = {}
                for name in object_names:
                    object_counts[name] = object_counts.get(name, 0) + 1
                
                # Create description based on detail level
                if detail_level == "basic":
                    if len(object_counts) > 0:
                        main_objects = list(object_counts.keys())[:3]
                        return f"Scene contains {', '.join(main_objects)}."
                    else:
                        return "Scene with various objects."
                
                elif detail_level == "detailed":
                    description_parts = []
                    
                    # Describe main objects
                    if object_counts:
                        main_objects = []
                        for obj, count in list(object_counts.items())[:5]:
                            if count > 1:
                                main_objects.append(f"{count} {obj}s")
                            else:
                                main_objects.append(f"a {obj}")
                        
                        if main_objects:
                            description_parts.append(f"The scene shows {', '.join(main_objects)}")
                    
                    # Add spatial information
                    spatial_info = self._analyze_spatial_layout(objects, image.size)
                    if spatial_info:
                        description_parts.append(spatial_info)
                    
                    return ". ".join(description_parts) + "."
                
                else:  # comprehensive
                    description_parts = []
                    
                    # Detailed object description
                    if object_counts:
                        description_parts.append(f"This scene contains {len(objects)} detected objects")
                        
                        # Group objects by category
                        categories = {}
                        for obj in objects:
                            category = self._get_object_category(obj["name"])
                            if category not in categories:
                                categories[category] = []
                            categories[category].append(obj["name"])
                        
                        for category, items in categories.items():
                            unique_items = list(set(items))
                            description_parts.append(f"{category}: {', '.join(unique_items[:3])}")
                    
                    # Spatial layout
                    spatial_info = self._analyze_spatial_layout(objects, image.size)
                    if spatial_info:
                        description_parts.append(f"Layout: {spatial_info}")
                    
                    # Lighting and environment
                    description_parts.append("The environment appears to be well-lit with good visibility")
                    
                    return ". ".join(description_parts) + "."
            
            else:
                # No objects detected
                return "The scene appears to be empty or contains objects that could not be clearly identified."
                
        except Exception as e:
            logger.error(f"Scene description generation failed: {e}")
            return "Unable to generate scene description."
    
    async def _openai_scene_description(self, image: Image.Image, objects: List[Dict[str, Any]]) -> str:
        """Generate scene description using OpenAI"""
        try:
            # Convert image to base64 for OpenAI
            buffer = io.BytesIO()
            image.save(buffer, format='JPEG')
            
            object_list = [obj["name"] for obj in objects[:10]]
            
            prompt = f"""Describe this scene in detail for a visually impaired person. 
            Detected objects include: {', '.join(object_list) if object_list else 'none detected'}.
            
            Provide a clear, helpful description that includes:
            - Overall scene layout and environment
            - Key objects and their approximate locations
            - Any text or signage visible
            - Spatial relationships between objects
            - Lighting and accessibility considerations
            
            Keep the description natural and helpful for navigation and understanding."""
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{buffer.getvalue().hex()}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI scene description failed: {e}")
            # Fallback to object-based description
            if objects:
                object_names = [obj["name"] for obj in objects[:5]]
                return f"Scene contains {', '.join(object_names)} and other objects."
            return "Scene with various objects and elements."
    
    async def _mock_object_detection(self, image: Image.Image, confidence_threshold: float) -> List[Dict[str, Any]]:
        """Mock object detection for development"""
        await asyncio.sleep(0.3)  # Simulate processing time
        
        # Generate mock objects based on image characteristics
        width, height = image.size
        
        mock_objects = [
            {"name": "person", "confidence": 0.95, "category": "person"},
            {"name": "chair", "confidence": 0.87, "category": "furniture"},
            {"name": "table", "confidence": 0.92, "category": "furniture"},
            {"name": "book", "confidence": 0.78, "category": "object"},
            {"name": "lamp", "confidence": 0.83, "category": "furniture"},
            {"name": "window", "confidence": 0.90, "category": "structure"},
            {"name": "door", "confidence": 0.85, "category": "structure"},
            {"name": "plant", "confidence": 0.72, "category": "nature"},
        ]
        
        # Filter by confidence and add bounding boxes
        filtered_objects = []
        for i, obj in enumerate(mock_objects):
            if obj["confidence"] >= confidence_threshold:
                # Generate random but realistic bounding box
                x = (i * 100) % (width - 100)
                y = (i * 80) % (height - 80)
                w = 80 + (i * 20) % 100
                h = 60 + (i * 15) % 80
                
                filtered_objects.append({
                    "name": obj["name"],
                    "confidence": obj["confidence"],
                    "boundingBox": {
                        "x": x,
                        "y": y,
                        "width": w,
                        "height": h
                    },
                    "category": obj["category"],
                    "distance": self._estimate_distance(x, y, x + w, y + h, (width, height))
                })
        
        return filtered_objects
    
    def _get_object_category(self, object_name: str) -> str:
        """Categorize detected objects"""
        categories = {
            "person": ["person", "people", "human", "man", "woman", "child"],
            "vehicle": ["car", "truck", "bus", "bicycle", "motorcycle", "train"],
            "furniture": ["chair", "table", "sofa", "bed", "desk", "shelf"],
            "electronics": ["tv", "computer", "phone", "laptop", "monitor"],
            "nature": ["tree", "plant", "flower", "grass", "sky", "cloud"],
            "structure": ["building", "wall", "door", "window", "stairs", "bridge"],
            "object": ["book", "bag", "bottle", "cup", "plate", "tool"]
        }
        
        object_lower = object_name.lower()
        for category, items in categories.items():
            if any(item in object_lower for item in items):
                return category
        
        return "object"
    
    def _estimate_distance(self, x1: float, y1: float, x2: float, y2: float, image_size: Tuple[int, int]) -> Optional[float]:
        """Estimate distance to object based on bounding box size and position"""
        try:
            width, height = image_size
            bbox_width = x2 - x1
            bbox_height = y2 - y1
            bbox_area = bbox_width * bbox_height
            
            # Simple heuristic: larger objects are closer
            # This is a very rough approximation
            image_area = width * height
            relative_size = bbox_area / image_area
            
            if relative_size > 0.3:
                return 1.0  # Very close (1 meter)
            elif relative_size > 0.1:
                return 3.0  # Close (3 meters)
            elif relative_size > 0.05:
                return 5.0  # Medium distance (5 meters)
            elif relative_size > 0.01:
                return 10.0  # Far (10 meters)
            else:
                return 15.0  # Very far (15+ meters)
                
        except Exception as e:
            logger.error(f"Distance estimation failed: {e}")
            return None
    
    def _analyze_spatial_layout(self, objects: List[Dict[str, Any]], image_size: Tuple[int, int]) -> str:
        """Analyze spatial relationships between objects"""
        try:
            if not objects:
                return "Empty scene"
            
            width, height = image_size
            
            # Analyze object positions
            left_objects = []
            center_objects = []
            right_objects = []
            
            for obj in objects:
                bbox = obj.get("boundingBox", {})
                center_x = bbox.get("x", 0) + bbox.get("width", 0) / 2
                
                if center_x < width / 3:
                    left_objects.append(obj["name"])
                elif center_x > 2 * width / 3:
                    right_objects.append(obj["name"])
                else:
                    center_objects.append(obj["name"])
            
            # Generate spatial description
            parts = []
            if left_objects:
                parts.append(f"On the left: {', '.join(left_objects[:3])}")
            if center_objects:
                parts.append(f"In the center: {', '.join(center_objects[:3])}")
            if right_objects:
                parts.append(f"On the right: {', '.join(right_objects[:3])}")
            
            return ". ".join(parts) if parts else "Objects distributed throughout the scene"
            
        except Exception as e:
            logger.error(f"Spatial analysis failed: {e}")
            return "Spatial layout analysis unavailable"
    
    async def detect_obstacles(
        self, 
        image_data: bytes,
        safety_mode: bool = True
    ) -> Dict[str, Any]:
        """Detect obstacles and hazards for navigation safety"""
        try:
            # Get object detection results
            object_result = await self.detect_objects(image_data, confidence_threshold=0.5)
            objects = object_result.get("objects", [])
            
            # Classify objects as obstacles
            obstacles = []
            for obj in objects:
                if self._is_obstacle(obj["name"]):
                    obstacle = {
                        "type": obj["name"],
                        "confidence": obj["confidence"],
                        "boundingBox": obj["boundingBox"],
                        "distance": obj.get("distance"),
                        "severity": self._assess_obstacle_severity(obj),
                        "direction": self._get_obstacle_direction(obj["boundingBox"], object_result.get("imageSize", (640, 480)))
                    }
                    obstacles.append(obstacle)
            
            # Generate safety warnings
            warnings = await self._generate_safety_warnings(obstacles, safety_mode)
            
            return {
                "obstacles": obstacles,
                "warnings": warnings,
                "safetyLevel": self._assess_overall_safety(obstacles),
                "totalObstacles": len(obstacles),
                "processingTime": object_result.get("processingTime", 0)
            }
            
        except Exception as e:
            logger.error(f"Obstacle detection failed: {e}")
            raise
    
    def _is_obstacle(self, object_name: str) -> bool:
        """Determine if an object is considered an obstacle"""
        obstacles = {
            "person", "people", "car", "truck", "bus", "bicycle", "motorcycle",
            "pole", "tree", "bench", "barrier", "construction", "cone",
            "stairs", "step", "curb", "pothole", "debris", "sign"
        }
        return any(obstacle in object_name.lower() for obstacle in obstacles)
    
    def _assess_obstacle_severity(self, obstacle: Dict[str, Any]) -> str:
        """Assess the severity of an obstacle"""
        distance = obstacle.get("distance", 10)
        object_type = obstacle["name"].lower()
        
        # High-risk objects
        if any(risk in object_type for risk in ["car", "truck", "bus", "stairs", "pothole", "construction"]):
            if distance < 2.0:
                return "high"
            elif distance < 5.0:
                return "medium"
            else:
                return "low"
        
        # Medium-risk objects
        elif any(risk in object_type for risk in ["person", "bicycle", "pole", "barrier", "cone"]):
            if distance < 1.0:
                return "high"
            elif distance < 3.0:
                return "medium"
            else:
                return "low"
        
        # Low-risk objects
        else:
            return "low"
    
    def _get_obstacle_direction(self, bbox: Dict[str, Any], image_size: Tuple[int, int]) -> str:
        """Get direction of obstacle relative to center"""
        try:
            width, height = image_size
            center_x = bbox.get("x", 0) + bbox.get("width", 0) / 2
            center_y = bbox.get("y", 0) + bbox.get("height", 0) / 2
            
            image_center_x = width / 2
            image_center_y = height / 2
            
            # Determine horizontal direction
            if center_x < image_center_x - width * 0.2:
                horizontal = "left"
            elif center_x > image_center_x + width * 0.2:
                horizontal = "right"
            else:
                horizontal = "center"
            
            # Determine vertical direction
            if center_y < image_center_y - height * 0.2:
                vertical = "top"
            elif center_y > image_center_y + height * 0.2:
                vertical = "bottom"
            else:
                vertical = "middle"
            
            # Combine directions
            if horizontal == "center" and vertical == "middle":
                return "directly ahead"
            elif horizontal == "center":
                return f"{vertical} center"
            elif vertical == "middle":
                return horizontal
            else:
                return f"{vertical} {horizontal}"
                
        except Exception as e:
            logger.error(f"Direction calculation failed: {e}")
            return "unknown direction"
    
    async def _generate_safety_warnings(
        self, 
        obstacles: List[Dict[str, Any]], 
        safety_mode: bool
    ) -> List[Dict[str, Any]]:
        """Generate safety warnings based on detected obstacles"""
        warnings = []
        
        for obstacle in obstacles:
            severity = obstacle["severity"]
            distance = obstacle.get("distance", 10)
            direction = obstacle["direction"]
            obj_type = obstacle["type"]
            
            if severity == "high":
                message = f"⚠️ DANGER: {obj_type} {direction} at {distance:.1f}m - STOP and assess"
                priority = "critical"
            elif severity == "medium":
                message = f"⚠️ CAUTION: {obj_type} {direction} at {distance:.1f}m - proceed carefully"
                priority = "high"
            else:
                message = f"ℹ️ NOTE: {obj_type} detected {direction} at {distance:.1f}m"
                priority = "low"
            
            warnings.append({
                "message": message,
                "priority": priority,
                "obstacleType": obj_type,
                "distance": distance,
                "direction": direction,
                "severity": severity,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            })
        
        # Sort by priority and distance
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        warnings.sort(key=lambda x: (priority_order.get(x["priority"], 3), x["distance"]))
        
        return warnings
    
    def _assess_overall_safety(self, obstacles: List[Dict[str, Any]]) -> str:
        """Assess overall safety level"""
        if not obstacles:
            return "safe"
        
        high_severity = sum(1 for obs in obstacles if obs["severity"] == "high")
        medium_severity = sum(1 for obs in obstacles if obs["severity"] == "medium")
        
        if high_severity > 0:
            return "dangerous"
        elif medium_severity > 2:
            return "caution"
        elif medium_severity > 0:
            return "moderate"
        else:
            return "safe"
    
    async def generate_navigation_instructions(
        self,
        current_location: Dict[str, float],
        destination: str,
        mode: str = "walking",
        accessibility_preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate navigation instructions with accessibility considerations"""
        try:
            # Mock navigation service (would integrate with real mapping service)
            start_time = time.time()
            
            # Generate mock route
            route_steps = [
                {
                    "instruction": f"Head north from your current location",
                    "distance": 100,
                    "duration": 120,
                    "maneuver": "straight",
                    "warnings": [],
                    "accessibility": {
                        "hasElevator": False,
                        "hasRamp": True,
                        "hasStairs": False,
                        "hasCrossing": False,
                        "hasAudioSignal": True
                    }
                },
                {
                    "instruction": f"Turn right onto Main Street",
                    "distance": 200,
                    "duration": 240,
                    "maneuver": "turn-right",
                    "warnings": ["Busy intersection ahead"],
                    "accessibility": {
                        "hasElevator": False,
                        "hasRamp": False,
                        "hasStairs": False,
                        "hasCrossing": True,
                        "hasAudioSignal": True
                    }
                },
                {
                    "instruction": f"Continue straight for 300 meters",
                    "distance": 300,
                    "duration": 360,
                    "maneuver": "straight",
                    "warnings": [],
                    "accessibility": {
                        "hasElevator": False,
                        "hasRamp": True,
                        "hasStairs": False,
                        "hasCrossing": False,
                        "hasAudioSignal": False
                    }
                },
                {
                    "instruction": f"Arrive at {destination}",
                    "distance": 0,
                    "duration": 0,
                    "maneuver": "arrive",
                    "warnings": [],
                    "accessibility": {
                        "hasElevator": True,
                        "hasRamp": True,
                        "hasStairs": False,
                        "hasCrossing": False,
                        "hasAudioSignal": False
                    }
                }
            ]
            
            total_distance = sum(step["distance"] for step in route_steps)
            total_duration = sum(step["duration"] for step in route_steps)
            
            # Apply accessibility preferences
            if accessibility_preferences:
                route_steps = self._apply_accessibility_preferences(route_steps, accessibility_preferences)
            
            result = {
                "id": str(int(time.time() * 1000)),
                "origin": current_location,
                "destination": {"name": destination},
                "mode": mode,
                "distance": total_distance,
                "duration": total_duration,
                "steps": route_steps,
                "accessibility": {
                    "wheelchairAccessible": all(not step["accessibility"]["hasStairs"] for step in route_steps),
                    "hasElevators": any(step["accessibility"]["hasElevator"] for step in route_steps),
                    "hasRamps": any(step["accessibility"]["hasRamp"] for step in route_steps),
                    "hasAudioSignals": any(step["accessibility"]["hasAudioSignal"] for step in route_steps),
                },
                "processingTime": (time.time() - start_time) * 1000,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Navigation instruction generation failed: {e}")
            raise
    
    def _apply_accessibility_preferences(
        self, 
        route_steps: List[Dict[str, Any]], 
        preferences: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Apply accessibility preferences to route"""
        try:
            # Add warnings based on preferences
            for step in route_steps:
                accessibility = step["accessibility"]
                warnings = step.get("warnings", [])
                
                if preferences.get("avoidStairs", False) and accessibility["hasStairs"]:
                    warnings.append("⚠️ Route contains stairs - alternative route recommended")
                
                if preferences.get("preferElevators", False) and not accessibility["hasElevator"]:
                    warnings.append("ℹ️ No elevator available at this location")
                
                if preferences.get("requireAudioSignals", False) and not accessibility["hasAudioSignal"]:
                    warnings.append("⚠️ No audio crossing signal - use caution")
                
                step["warnings"] = warnings
            
            return route_steps
            
        except Exception as e:
            logger.error(f"Failed to apply accessibility preferences: {e}")
            return route_steps

# Global accessibility service instance
accessibility_service = AccessibilityService()