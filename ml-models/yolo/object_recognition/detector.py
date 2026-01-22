import cv2
import numpy as np
from ultralytics import YOLO
import torch
from typing import List, Dict, Tuple
import yaml

class ObjectRecognizer:
    def __init__(self, model_path='weights/yolov8n.pt', config_path='config.yaml'):
        """Initialize YOLO object recognizer"""
        self.model = YOLO(model_path)
        self.config = self.load_config(config_path)
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model.to(self.device)
        
        # COCO class names
        self.class_names = [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
            'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
            'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
            'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
            'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
            'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
            'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
            'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
            'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
            'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
            'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
            'toothbrush'
        ]
        
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
                'target_classes': 'all',  # 'all' or list of class names
                'min_object_size': 0.01,  # relative to frame size
                'max_object_size': 0.8    # relative to frame size
            }
    
    def filter_objects(self, detections: List[Dict]) -> List[Dict]:
        """Filter objects based on configuration"""
        filtered = []
        frame_area = detections[0]['frame_area'] if detections else 1
        
        for detection in detections:
            # Filter by target classes
            if self.config['target_classes'] != 'all':
                if detection['class'] not in self.config['target_classes']:
                    continue
            
            # Filter by size
            bbox_area = detection['bbox_area']
            relative_size = bbox_area / frame_area
            
            if relative_size < self.config['min_object_size']:
                continue
            if relative_size > self.config['max_object_size']:
                continue
            
            filtered.append(detection)
        
        return filtered
    
    def recognize_objects(self, image: np.ndarray) -> Dict:
        """Recognize objects in image"""
        try:
            # Run inference
            results = self.model(
                image,
                conf=self.config['confidence_threshold'],
                iou=self.config['iou_threshold'],
                max_det=self.config['max_detections']
            )
            
            frame_height, frame_width = image.shape[:2]
            frame_area = frame_width * frame_height
            objects = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        # Get class name
                        class_name = self.class_names[class_id] if class_id < len(self.class_names) else 'unknown'
                        
                        # Calculate object properties
                        bbox_width = x2 - x1
                        bbox_height = y2 - y1
                        bbox_area = bbox_width * bbox_height
                        center_x = (x1 + x2) // 2
                        center_y = (y1 + y2) // 2
                        
                        # Position relative to frame center
                        frame_center_x = frame_width // 2
                        frame_center_y = frame_height // 2
                        relative_x = (center_x - frame_center_x) / frame_center_x
                        relative_y = (center_y - frame_center_y) / frame_center_y
                        
                        object_data = {
                            'class': class_name,
                            'class_id': class_id,
                            'confidence': float(confidence),
                            'bbox': [int(x1), int(y1), int(x2), int(y2)],
                            'center': [int(center_x), int(center_y)],
                            'size': [int(bbox_width), int(bbox_height)],
                            'bbox_area': bbox_area,
                            'frame_area': frame_area,
                            'relative_size': bbox_area / frame_area,
                            'relative_position': [relative_x, relative_y],
                            'position': self.get_position_description(relative_x, relative_y)
                        }
                        
                        objects.append(object_data)
            
            # Filter objects
            filtered_objects = self.filter_objects(objects)
            
            # Sort by confidence
            filtered_objects.sort(key=lambda x: x['confidence'], reverse=True)
            
            return {
                'objects': filtered_objects,
                'total_objects': len(filtered_objects),
                'frame_size': [frame_width, frame_height],
                'classes_detected': list(set(obj['class'] for obj in filtered_objects)),
                'primary_object': filtered_objects[0] if filtered_objects else None
            }
            
        except Exception as e:
            return {
                'objects': [],
                'error': str(e)
            }
    
    def get_position_description(self, relative_x: float, relative_y: float) -> str:
        """Get human-readable position description"""
        # Horizontal position
        if relative_x < -0.3:
            horizontal = "left"
        elif relative_x > 0.3:
            horizontal = "right"
        else:
            horizontal = "center"
        
        # Vertical position
        if relative_y < -0.3:
            vertical = "top"
        elif relative_y > 0.3:
            vertical = "bottom"
        else:
            vertical = "middle"
        
        # Combine
        if horizontal == "center" and vertical == "middle":
            return "center"
        elif horizontal == "center":
            return vertical
        elif vertical == "middle":
            return horizontal
        else:
            return f"{vertical} {horizontal}"
    
    def draw_detections(self, image: np.ndarray, detections: Dict) -> np.ndarray:
        """Draw object detections on image"""
        annotated_image = image.copy()
        
        for obj in detections.get('objects', []):
            x1, y1, x2, y2 = obj['bbox']
            confidence = obj['confidence']
            class_name = obj['class']
            position = obj['position']
            
            # Color based on confidence
            if confidence > 0.8:
                color = (0, 255, 0)  # Green - high confidence
            elif confidence > 0.6:
                color = (0, 165, 255)  # Orange - medium confidence
            else:
                color = (0, 0, 255)  # Red - low confidence
            
            # Draw bounding box
            cv2.rectangle(annotated_image, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            label = f"{class_name} {confidence:.2f} ({position})"
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
    
    def get_audio_description(self, detections: Dict) -> str:
        """Generate audio description of detected objects"""
        objects = detections.get('objects', [])
        
        if not objects:
            return "No objects detected"
        
        # Get top 3 most confident objects
        top_objects = objects[:3]
        
        descriptions = []
        for obj in top_objects:
            class_name = obj['class']
            position = obj['position']
            confidence = obj['confidence']
            
            if confidence > 0.8:
                confidence_desc = "clearly"
            elif confidence > 0.6:
                confidence_desc = "possibly"
            else:
                confidence_desc = "might be"
            
            if position == "center":
                position_desc = "in front of you"
            else:
                position_desc = f"to your {position}"
            
            descriptions.append(f"{confidence_desc} {class_name} {position_desc}")
        
        if len(descriptions) == 1:
            return descriptions[0]
        elif len(descriptions) == 2:
            return f"{descriptions[0]} and {descriptions[1]}"
        else:
            return f"{descriptions[0]}, {descriptions[1]}, and {descriptions[2]}"
    
    def get_object_summary(self, detections: Dict) -> Dict:
        """Get summary statistics of detected objects"""
        objects = detections.get('objects', [])
        
        if not objects:
            return {
                'total_count': 0,
                'class_counts': {},
                'confidence_stats': {},
                'position_distribution': {}
            }
        
        # Count by class
        class_counts = {}
        for obj in objects:
            class_name = obj['class']
            class_counts[class_name] = class_counts.get(class_name, 0) + 1
        
        # Confidence statistics
        confidences = [obj['confidence'] for obj in objects]
        confidence_stats = {
            'mean': np.mean(confidences),
            'min': np.min(confidences),
            'max': np.max(confidences),
            'std': np.std(confidences)
        }
        
        # Position distribution
        position_counts = {}
        for obj in objects:
            position = obj['position']
            position_counts[position] = position_counts.get(position, 0) + 1
        
        return {
            'total_count': len(objects),
            'class_counts': class_counts,
            'confidence_stats': confidence_stats,
            'position_distribution': position_counts
        }

if __name__ == "__main__":
    # Test with webcam
    recognizer = ObjectRecognizer()
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Recognize objects
        detections = recognizer.recognize_objects(frame)
        
        # Draw detections
        frame = recognizer.draw_detections(frame, detections)
        
        # Get audio description
        description = recognizer.get_audio_description(detections)
        print("Audio description:", description)
        
        cv2.imshow('Object Recognition', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
