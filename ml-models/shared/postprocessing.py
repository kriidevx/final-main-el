import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging
from collections import defaultdict

class PostProcessor:
    """Post-processing utilities for ML model outputs"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def apply_nms(self, detections: List[Dict], 
                  iou_threshold: float = 0.45,
                  score_threshold: float = 0.5) -> List[Dict]:
        """Apply Non-Maximum Suppression to detections"""
        if not detections:
            return []
        
        # Filter by score threshold
        filtered_detections = [
            det for det in detections 
            if det.get('confidence', 0) >= score_threshold
        ]
        
        if not filtered_detections:
            return []
        
        # Sort by confidence
        filtered_detections.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Apply NMS
        keep_detections = []
        
        for detection in filtered_detections:
            keep = True
            
            for kept_detection in keep_detections:
                iou = self._calculate_iou(
                    detection['bbox'], 
                    kept_detection['bbox']
                )
                
                if iou > iou_threshold:
                    keep = False
                    break
            
            if keep:
                keep_detections.append(detection)
        
        return keep_detections
    
    def _calculate_iou(self, bbox1: List[int], bbox2: List[int]) -> float:
        """Calculate Intersection over Union (IoU) for two bounding boxes"""
        x1_1, y1_1, x2_1, y2_1 = bbox1
        x1_2, y1_2, x2_2, y2_2 = bbox2
        
        # Calculate intersection
        x1_i = max(x1_1, x1_2)
        y1_i = max(y1_1, y1_2)
        x2_i = min(x2_1, x2_2)
        y2_i = min(y2_1, y2_2)
        
        if x2_i <= x1_i or y2_i <= y1_i:
            return 0.0
        
        intersection = (x2_i - x1_i) * (y2_i - y1_i)
        
        # Calculate union
        area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
        area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
        union = area1 + area2 - intersection
        
        return intersection / union if union > 0 else 0.0
    
    def smooth_predictions(self, predictions: List[Dict],
                          window_size: int = 5,
                          confidence_threshold: float = 0.5) -> List[Dict]:
        """Smooth predictions over time using temporal averaging"""
        if len(predictions) < window_size:
            return predictions
        
        smoothed = []
        
        for i in range(len(predictions)):
            start_idx = max(0, i - window_size // 2)
            end_idx = min(len(predictions), i + window_size // 2 + 1)
            
            window_predictions = predictions[start_idx:end_idx]
            
            # Average confidence for same classes
            class_confidences = defaultdict(list)
            class_counts = defaultdict(int)
            
            for pred in window_predictions:
                class_name = pred.get('class', 'unknown')
                confidence = pred.get('confidence', 0)
                
                if confidence > confidence_threshold:
                    class_confidences[class_name].append(confidence)
                    class_counts[class_name] += 1
            
            # Find most frequent class with highest average confidence
            best_class = None
            best_confidence = 0
            best_count = 0
            
            for class_name, confidences in class_confidences.items():
                avg_confidence = np.mean(confidences)
                count = class_counts[class_name]
                
                if (count > best_count) or (count == best_count and avg_confidence > best_confidence):
                    best_class = class_name
                    best_confidence = avg_confidence
                    best_count = count
            
            if best_class:
                smoothed.append({
                    'class': best_class,
                    'confidence': best_confidence,
                    'count': best_count,
                    'window_size': len(window_predictions)
                })
        
        return smoothed
    
    def filter_by_confidence(self, predictions: List[Dict],
                           threshold: float = 0.5) -> List[Dict]:
        """Filter predictions by confidence threshold"""
        return [
            pred for pred in predictions 
            if pred.get('confidence', 0) >= threshold
        ]
    
    def merge_overlapping_detections(self, detections: List[Dict],
                                   iou_threshold: float = 0.3) -> List[Dict]:
        """Merge overlapping detections of the same class"""
        if not detections:
            return []
        
        # Group by class
        class_groups = defaultdict(list)
        for detection in detections:
            class_name = detection.get('class', 'unknown')
            class_groups[class_name].append(detection)
        
        merged_detections = []
        
        for class_name, class_detections in class_groups.items():
            # Sort by confidence
            class_detections.sort(key=lambda x: x['confidence'], reverse=True)
            
            merged = []
            
            for detection in class_detections:
                merged_with = False
                
                for i, existing in enumerate(merged):
                    iou = self._calculate_iou(
                        detection['bbox'],
                        existing['bbox']
                    )
                    
                    if iou > iou_threshold:
                        # Merge detections
                        merged[i] = self._merge_two_detections(existing, detection)
                        merged_with = True
                        break
                
                if not merged_with:
                    merged.append(detection)
            
            merged_detections.extend(merged)
        
        return merged_detections
    
    def _merge_two_detections(self, det1: Dict, det2: Dict) -> Dict:
        """Merge two overlapping detections"""
        bbox1 = det1['bbox']
        bbox2 = det2['bbox']
        
        # Merge bounding boxes
        x1 = min(bbox1[0], bbox2[0])
        y1 = min(bbox1[1], bbox2[1])
        x2 = max(bbox1[2], bbox2[2])
        y2 = max(bbox1[3], bbox2[3])
        
        # Average confidence
        confidence = (det1['confidence'] + det2['confidence']) / 2
        
        return {
            'class': det1['class'],
            'confidence': confidence,
            'bbox': [x1, y1, x2, y2],
            'merged': True
        }
    
    def apply_temporal_filter(self, detections_history: List[List[Dict]],
                            min_appearances: int = 3,
                            max_disappeared: int = 5) -> List[Dict]:
        """Apply temporal filtering to reduce false positives"""
        if not detections_history:
            return []
        
        # Track objects over time
        object_tracks = {}
        track_id_counter = 0
        
        for frame_idx, detections in enumerate(detections_history):
            current_objects = {}
            
            for detection in detections:
                # Find matching track
                matched_track = None
                
                for track_id, track in object_tracks.items():
                    if track['class'] == detection['class']:
                        # Check spatial proximity (simplified)
                        if frame_idx > 0:
                            last_bbox = track['last_bbox']
                            current_bbox = detection['bbox']
                            
                            # Calculate center distance
                            center1 = ((last_bbox[0] + last_bbox[2]) / 2, 
                                     (last_bbox[1] + last_bbox[3]) / 2)
                            center2 = ((current_bbox[0] + current_bbox[2]) / 2,
                                     (current_bbox[1] + current_bbox[3]) / 2)
                            
                            distance = np.sqrt(
                                (center1[0] - center2[0])**2 + 
                                (center1[1] - center2[1])**2
                            )
                            
                            if distance < 100:  # Threshold for matching
                                matched_track = track_id
                                break
                
                if matched_track is not None:
                    # Update existing track
                    object_tracks[matched_track]['appearances'] += 1
                    object_tracks[matched_track]['last_bbox'] = detection['bbox']
                    object_tracks[matched_track]['last_seen'] = frame_idx
                    object_tracks[matched_track]['confidence'] = detection['confidence']
                    current_objects[matched_track] = object_tracks[matched_track]
                else:
                    # Create new track
                    object_tracks[track_id_counter] = {
                        'class': detection['class'],
                        'appearances': 1,
                        'last_bbox': detection['bbox'],
                        'last_seen': frame_idx,
                        'confidence': detection['confidence'],
                        'created': frame_idx
                    }
                    current_objects[track_id_counter] = object_tracks[track_id_counter]
                    track_id_counter += 1
            
            # Update tracks (remove old ones)
            tracks_to_remove = []
            for track_id, track in object_tracks.items():
                if track_id not in current_objects:
                    track['disappeared'] = track.get('disappeared', 0) + 1
                    if track['disappeared'] > max_disappeared:
                        tracks_to_remove.append(track_id)
            
            for track_id in tracks_to_remove:
                del object_tracks[track_id]
        
        # Filter tracks by minimum appearances
        stable_objects = [
            track for track in object_tracks.values()
            if track['appearances'] >= min_appearances
        ]
        
        # Convert to detection format
        final_detections = []
        for track in stable_objects:
            final_detections.append({
                'class': track['class'],
                'confidence': track['confidence'],
                'bbox': track['last_bbox'],
                'track_id': id(track),
                'appearances': track['appearances']
            })
        
        return final_detections
    
    def format_output(self, predictions: List[Dict],
                     output_format: str = "json") -> Any:
        """Format predictions output"""
        if output_format == "json":
            return predictions
        elif output_format == "csv":
            # Convert to CSV format
            if not predictions:
                return ""
            
            headers = list(predictions[0].keys())
            csv_lines = [",".join(headers)]
            
            for pred in predictions:
                values = [str(pred.get(header, "")) for header in headers]
                csv_lines.append(",".join(values))
            
            return "\n".join(csv_lines)
        elif output_format == "xml":
            # Convert to XML format
            xml_lines = ["<predictions>"]
            
            for pred in predictions:
                xml_lines.append("  <prediction>")
                for key, value in pred.items():
                    xml_lines.append(f"    <{key}>{value}</{key}>")
                xml_lines.append("  </prediction>")
            
            xml_lines.append("</predictions>")
            return "\n".join(xml_lines)
        else:
            return predictions
    
    def calculate_metrics(self, predictions: List[Dict],
                         ground_truth: List[Dict]) -> Dict[str, float]:
        """Calculate evaluation metrics"""
        if not predictions or not ground_truth:
            return {
                'precision': 0.0,
                'recall': 0.0,
                'f1': 0.0,
                'accuracy': 0.0
            }
        
        # True positives, false positives, false negatives
        tp = 0
        fp = 0
        fn = 0
        
        # Simple matching based on class and IoU
        matched_gt = set()
        
        for pred in predictions:
            pred_class = pred.get('class', 'unknown')
            pred_bbox = pred.get('bbox', [])
            
            matched = False
            
            for i, gt in enumerate(ground_truth):
                if i in matched_gt:
                    continue
                
                gt_class = gt.get('class', 'unknown')
                gt_bbox = gt.get('bbox', [])
                
                if pred_class == gt_class:
                    if pred_bbox and gt_bbox:
                        iou = self._calculate_iou(pred_bbox, gt_bbox)
                        if iou > 0.5:  # IoU threshold for true positive
                            tp += 1
                            matched_gt.add(i)
                            matched = True
                            break
            
            if not matched:
                fp += 1
        
        fn = len(ground_truth) - len(matched_gt)
        
        # Calculate metrics
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        accuracy = tp / len(ground_truth) if ground_truth else 0
        
        return {
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'accuracy': accuracy,
            'true_positives': tp,
            'false_positives': fp,
            'false_negatives': fn
        }
    
    def ensemble_predictions(self, prediction_sets: List[List[Dict]],
                           weights: Optional[List[float]] = None) -> List[Dict]:
        """Ensemble multiple prediction sets"""
        if not prediction_sets:
            return []
        
        if weights is None:
            weights = [1.0 / len(prediction_sets)] * len(prediction_sets)
        
        # Collect all unique classes
        all_classes = set()
        for predictions in prediction_sets:
            for pred in predictions:
                all_classes.add(pred.get('class', 'unknown'))
        
        ensemble_predictions = []
        
        for class_name in all_classes:
            # Collect predictions for this class from all models
            class_predictions = []
            
            for i, predictions in enumerate(prediction_sets):
                for pred in predictions:
                    if pred.get('class') == class_name:
                        class_predictions.append({
                            'confidence': pred.get('confidence', 0) * weights[i],
                            'bbox': pred.get('bbox', [])
                        })
            
            if class_predictions:
                # Average confidence
                avg_confidence = np.mean([p['confidence'] for p in class_predictions])
                
                # Average bounding box (if available)
                bboxes = [p['bbox'] for p in class_predictions if p['bbox']]
                if bboxes:
                    avg_bbox = [
                        np.mean([bbox[0] for bbox in bboxes]),
                        np.mean([bbox[1] for bbox in bboxes]),
                        np.mean([bbox[2] for bbox in bboxes]),
                        np.mean([bbox[3] for bbox in bboxes])
                    ]
                else:
                    avg_bbox = []
                
                ensemble_predictions.append({
                    'class': class_name,
                    'confidence': avg_confidence,
                    'bbox': avg_bbox,
                    'ensemble_size': len(class_predictions)
                })
        
        # Sort by confidence
        ensemble_predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return ensemble_predictions

# Example usage
if __name__ == "__main__":
    postprocessor = PostProcessor()
    
    # Test NMS
    detections = [
        {'class': 'person', 'confidence': 0.9, 'bbox': [10, 10, 100, 100]},
        {'class': 'person', 'confidence': 0.8, 'bbox': [15, 15, 105, 105]},
        {'class': 'car', 'confidence': 0.7, 'bbox': [200, 200, 300, 300]}
    ]
    
    filtered = postprocessor.apply_nms(detections)
    print(f"NMS filtered detections: {len(filtered)}")
    
    # Test smoothing
    predictions_history = [
        [{'class': 'person', 'confidence': 0.8}],
        [{'class': 'person', 'confidence': 0.9}],
        [{'class': 'person', 'confidence': 0.7}],
        [{'class': 'car', 'confidence': 0.6}],
        [{'class': 'person', 'confidence': 0.8}]
    ]
    
    smoothed = postprocessor.smooth_predictions(predictions_history)
    print(f"Smoothed predictions: {len(smoothed)}")
    
    print("Postprocessor initialized successfully")
