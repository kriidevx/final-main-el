import cv2
import numpy as np
from ultralytics import YOLO
import torch
from typing import List, Dict, Tuple
import yaml

class ObstacleDetector:
    def __init__(self, model_path='weights/yolov8n.pt', config_path='config.yaml'):
        """Initialize YOLO obstacle detector"""
        self.model = YOLO(model_path)
        self.config = self.load_config(config_path)
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model.to(self.device)
        
        # Obstacle categories (COCO dataset classes that are obstacles)
        self.obstacle_classes = {
            0: 'person', 1: 'bicycle', 2: 'car', 3: 'motorcycle', 4: 'airplane',
            5: 'bus', 6: 'train', 7: 'truck', 9: 'traffic light', 10: 'fire hydrant',
            11: 'stop sign', 13: 'bench', 14: 'bird', 15: 'cat', 16: 'dog',
            17: 'horse', 18: 'sheep', 19: 'cow', 20: 'elephant', 21: 'bear',
            22: 'zebra', 23: 'giraffe', 27: 'truck', 28: 'traffic light', 31: 'handbag',
            33: 'backpack', 34: 'umbrella', 38: 'sports ball', 39: 'kite',
            40: 'baseball bat', 41: 'baseball glove', 42: 'skateboard', 43: 'surfboard',
            44: 'tennis racket', 47: 'cup', 48: 'fork', 49: 'knife', 50: 'spoon',
            56: 'chair', 57: 'couch', 58: 'potted plant', 59: 'bed', 60: 'dining table',
            62: 'toilet', 63: 'tv', 64: 'laptop', 65: 'mouse', 66: 'remote',
            67: 'keyboard', 68: 'cell phone', 70: 'book', 72: 'banana', 73: 'apple',
            74: 'sandwich', 75: 'orange', 76: 'broccoli', 77: 'carrot', 78: 'hot dog',
            79: 'pizza', 80: 'donut', 81: 'cake'
        }
        
    def load_config(self, config_path):
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            # Default config
            return {
                'confidence_threshold': 0.5,
                'iou_threshold': 0.45,
                'max_detections': 100,
                'obstacle_distance_threshold': 2.0,  # meters
                'warning_distance': 1.0  # meters
            }
    
    def calculate_distance(self, bbox: List[int], frame_width: int, frame_height: int) -> float:
        """Estimate distance based on bounding box size"""
        x1, y1, x2, y2 = bbox
        bbox_width = x2 - x1
        bbox_height = y2 - y1
        bbox_area = bbox_width * bbox_height
        frame_area = frame_width * frame_height
        
        # Simple distance estimation based on relative size
        # This is a simplified approach - real implementation would use camera calibration
        relative_size = bbox_area / frame_area
        
        # Empirical formula (adjust based on camera setup)
        if relative_size > 0.3:
            return 0.5  # Very close
        elif relative_size > 0.1:
            return 1.0  # Close
        elif relative_size > 0.05:
            return 2.0  # Medium distance
        elif relative_size > 0.02:
            return 3.0  # Far
        else:
            return 5.0  # Very far
    
    def detect_obstacles(self, image: np.ndarray) -> Dict:
        """Detect obstacles in image"""
        try:
            # Run inference
            results = self.model(
                image,
                conf=self.config['confidence_threshold'],
                iou=self.config['iou_threshold'],
                max_det=self.config['max_detections']
            )
            
            frame_height, frame_width = image.shape[:2]
            obstacles = []
            warnings = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        # Check if this class is an obstacle
                        if class_id in self.obstacle_classes:
                            class_name = self.obstacle_classes[class_id]
                            distance = self.calculate_distance(
                                [x1, y1, x2, y2], frame_width, frame_height
                            )
                            
                            obstacle = {
                                'class': class_name,
                                'confidence': float(confidence),
                                'bbox': [int(x1), int(y1), int(x2), int(y2)],
                                'distance': distance,
                                'center': [int((x1 + x2) / 2), int((y1 + y2) / 2)],
                                'size': [int(x2 - x1), int(y2 - y1)]
                            }
                            
                            obstacles.append(obstacle)
                            
                            # Check for warnings
                            if distance < self.config['warning_distance']:
                                warnings.append({
                                    'type': 'proximity_warning',
                                    'obstacle': obstacle,
                                    'message': f"{class_name} {distance:.1f}m ahead"
                                })
            
            # Sort obstacles by distance (closest first)
            obstacles.sort(key=lambda x: x['distance'])
            
            return {
                'obstacles': obstacles,
                'warnings': warnings,
                'total_obstacles': len(obstacles),
                'closest_obstacle': obstacles[0] if obstacles else None,
                'frame_size': [frame_width, frame_height]
            }
            
        except Exception as e:
            return {
                'obstacles': [],
                'warnings': [],
                'error': str(e)
            }
    
    def draw_detections(self, image: np.ndarray, detections: Dict) -> np.ndarray:
        """Draw obstacle detections on image"""
        annotated_image = image.copy()
        
        for obstacle in detections.get('obstacles', []):
            x1, y1, x2, y2 = obstacle['bbox']
            confidence = obstacle['confidence']
            class_name = obstacle['class']
            distance = obstacle['distance']
            
            # Color based on distance
            if distance < 1.0:
                color = (0, 0, 255)  # Red - very close
            elif distance < 2.0:
                color = (0, 165, 255)  # Orange - close
            else:
                color = (0, 255, 0)  # Green - far
            
            # Draw bounding box
            cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            label = f"{class_name} {confidence:.2f} ({distance:.1f}m)"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
            cv2.rectangle(
                annotated_image,
                (x1, y1 - label_size[1] - 10),
                (x1 + label_size[0], y1),
                color,
                -1
            )
            cv2.putText(
                annotated_image,
                label,
                (x1, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 255, 255),
                2
            )
        
        return annotated_image
    
    def get_audio_guidance(self, detections: Dict) -> List[str]:
        """Generate audio guidance messages"""
        messages = []
        obstacles = detections.get('obstacles', [])
        
        if not obstacles:
            messages.append("Path clear")
        else:
            closest = obstacles[0]
            distance = closest['distance']
            class_name = closest['class']
            
            if distance < 0.5:
                messages.append(f"Warning! {class_name} very close ahead")
            elif distance < 1.0:
                messages.append(f"Caution: {class_name} {distance:.1f} meters ahead")
            elif distance < 2.0:
                messages.append(f"{class_name} {distance:.1f} meters ahead")
            
            # Count obstacles
            if len(obstacles) > 1:
                messages.append(f"{len(obstacles)} obstacles detected")
        
        return messages

if __name__ == "__main__":
    # Test with webcam
    detector = ObstacleDetector()
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Detect obstacles
        detections = detector.detect_obstacles(frame)
        
        # Draw detections
        frame = detector.draw_detections(frame, detections)
        
        # Get audio guidance
        messages = detector.get_audio_guidance(detections)
        if messages:
            print("Audio guidance:", " | ".join(messages))
        
        cv2.imshow('Obstacle Detection', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
