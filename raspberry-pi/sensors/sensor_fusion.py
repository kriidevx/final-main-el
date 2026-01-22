import numpy as np
import time
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from collections import deque
import json

@dataclass
class SensorData:
    """Unified sensor data structure"""
    sensor_id: str
    sensor_type: str
    value: float
    unit: str
    timestamp: float
    confidence: float = 1.0
    position: Optional[Tuple[float, float, float]] = None

@dataclass
class FusedReading:
    """Fused sensor reading"""
    value: float
    unit: str
    timestamp: float
    confidence: float
    contributing_sensors: List[str]
    fusion_method: str

class KalmanFilter:
    """Simple Kalman filter for sensor fusion"""
    
    def __init__(self, process_variance: float = 1e-5, measurement_variance: float = 1e-3):
        self.process_variance = process_variance
        self.measurement_variance = measurement_variance
        self.estimated_value = 0.0
        self.estimated_variance = 1.0
        self.is_initialized = False
    
    def update(self, measurement: float, measurement_variance: float = None) -> float:
        """Update filter with new measurement"""
        if measurement_variance is None:
            measurement_variance = self.measurement_variance
        
        if not self.is_initialized:
            self.estimated_value = measurement
            self.estimated_variance = measurement_variance
            self.is_initialized = True
            return self.estimated_value
        
        # Prediction step
        predicted_variance = self.estimated_variance + self.process_variance
        
        # Update step
        kalman_gain = predicted_variance / (predicted_variance + measurement_variance)
        self.estimated_value = self.estimated_value + kalman_gain * (measurement - self.estimated_value)
        self.estimated_variance = (1 - kalman_gain) * predicted_variance
        
        return self.estimated_value

class SensorFusion:
    """Multi-sensor data fusion system"""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize sensor fusion system"""
        self.sensors = {}
        self.sensor_data = {}
        self.fusion_filters = {}
        self.data_buffers = {}
        
        # Fusion parameters
        self.buffer_size = 100
        self.fusion_interval = 0.1  # seconds
        self.confidence_threshold = 0.5
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Load configuration
        self.config = self.load_config(config_path)
        
        self.logger.info("Sensor fusion system initialized")
    
    def load_config(self, config_path: Optional[str]) -> Dict:
        """Load fusion configuration"""
        default_config = {
            'sensors': {
                'ultrasonic_front': {
                    'type': 'distance',
                    'position': (0, 0, 0),
                    'weight': 1.0,
                    'variance': 1.0
                },
                'ultrasonic_left': {
                    'type': 'distance',
                    'position': (-10, 0, 0),
                    'weight': 1.0,
                    'variance': 1.0
                },
                'ultrasonic_right': {
                    'type': 'distance',
                    'position': (10, 0, 0),
                    'weight': 1.0,
                    'variance': 1.0
                }
            },
            'fusion_methods': {
                'distance': 'kalman'
            },
            'thresholds': {
                'outlier_detection': 3.0,  # Standard deviations
                'min_confidence': 0.3
            }
        }
        
        if config_path:
            try:
                with open(config_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                self.logger.warning(f"Could not load config: {str(e)}")
        
        return default_config
    
    def add_sensor_data(self, sensor_data: SensorData):
        """Add new sensor data"""
        sensor_id = sensor_data.sensor_id
        
        # Initialize data buffer if needed
        if sensor_id not in self.data_buffers:
            self.data_buffers[sensor_id] = deque(maxlen=self.buffer_size)
        
        # Add to buffer
        self.data_buffers[sensor_id].append(sensor_data)
        
        # Initialize Kalman filter if needed
        if sensor_id not in self.fusion_filters:
            sensor_config = self.config['sensors'].get(sensor_id, {})
            variance = sensor_config.get('variance', 1.0)
            self.fusion_filters[sensor_id] = KalmanFilter(measurement_variance=variance)
        
        self.logger.debug(f"Added data from {sensor_id}: {sensor_data.value} {sensor_data.unit}")
    
    def fuse_distance_sensors(self) -> Optional[FusedReading]:
        """Fuse distance sensor readings"""
        distance_sensors = []
        
        # Collect distance sensors
        for sensor_id, sensor_config in self.config['sensors'].items():
            if sensor_config.get('type') == 'distance':
                if sensor_id in self.data_buffers and self.data_buffers[sensor_id]:
                    latest_data = self.data_buffers[sensor_id][-1]
                    if latest_data.confidence >= self.confidence_threshold:
                        distance_sensors.append((sensor_id, latest_data))
        
        if not distance_sensors:
            return None
        
        # Remove outliers
        filtered_sensors = self._remove_outliers(distance_sensors)
        
        if not filtered_sensors:
            return None
        
        # Fuse using weighted average
        fused_value = 0.0
        total_weight = 0.0
        contributing_sensors = []
        
        for sensor_id, sensor_data in filtered_sensors:
            weight = self.config['sensors'][sensor_id].get('weight', 1.0) * sensor_data.confidence
            fused_value += sensor_data.value * weight
            total_weight += weight
            contributing_sensors.append(sensor_id)
        
        if total_weight > 0:
            fused_value /= total_weight
            
            # Apply Kalman filter
            if 'distance' in self.fusion_filters:
                fused_value = self.fusion_filters['distance'].update(fused_value)
            
            return FusedReading(
                value=fused_value,
                unit='cm',
                timestamp=time.time(),
                confidence=min(total_weight, 1.0),
                contributing_sensors=contributing_sensors,
                fusion_method='weighted_average_kalman'
            )
        
        return None
    
    def fuse_all_sensors(self) -> Dict[str, FusedReading]:
        """Fuse all sensor types"""
        fused_readings = {}
        
        # Fuse distance sensors
        distance_fusion = self.fuse_distance_sensors()
        if distance_fusion:
            fused_readings['distance'] = distance_fusion
        
        # Add other sensor fusion methods here
        # e.g., fuse_temperature_sensors(), fuse_imu_sensors(), etc.
        
        return fused_readings
    
    def _remove_outliers(self, sensor_data_list: List[Tuple[str, SensorData]]) -> List[Tuple[str, SensorData]]:
        """Remove outliers using statistical methods"""
        if len(sensor_data_list) < 3:
            return sensor_data_list
        
        # Extract values
        values = [data.value for _, data in sensor_data_list]
        mean = np.mean(values)
        std = np.std(values)
        
        # Remove outliers (more than 3 standard deviations)
        threshold = self.config['thresholds']['outlier_detection']
        filtered = []
        
        for sensor_id, sensor_data in sensor_data_list:
            z_score = abs(sensor_data.value - mean) / std if std > 0 else 0
            if z_score <= threshold:
                filtered.append((sensor_id, sensor_data))
        
        return filtered
    
    def get_sensor_status(self) -> Dict[str, Dict]:
        """Get status of all sensors"""
        status = {}
        
        for sensor_id, buffer in self.data_buffers.items():
            if buffer:
                latest = buffer[-1]
                status[sensor_id] = {
                    'last_reading': latest.value,
                    'last_timestamp': latest.timestamp,
                    'confidence': latest.confidence,
                    'buffer_size': len(buffer),
                    'data_rate': len(buffer) / (time.time() - buffer[0].timestamp) if len(buffer) > 1 else 0
                }
            else:
                status[sensor_id] = {
                    'status': 'no_data',
                    'buffer_size': 0
                }
        
        return status
    
    def get_fusion_statistics(self) -> Dict[str, Dict]:
        """Get fusion statistics"""
        stats = {}
        
        for sensor_id, buffer in self.data_buffers.items():
            if len(buffer) > 1:
                values = [data.value for data in buffer]
                stats[sensor_id] = {
                    'count': len(values),
                    'mean': np.mean(values),
                    'std': np.std(values),
                    'min': np.min(values),
                    'max': np.max(values),
                    'latest': values[-1],
                    'trend': 'increasing' if values[-1] > values[0] else 'decreasing'
                }
        
        return stats
    
    def detect_anomalies(self) -> List[Dict]:
        """Detect anomalies in sensor data"""
        anomalies = []
        
        for sensor_id, buffer in self.data_buffers.items():
            if len(buffer) < 10:
                continue
            
            # Get recent values
            recent_values = [data.value for data in list(buffer)[-10:]]
            older_values = [data.value for data in list(buffer)[-20:-10]] if len(buffer) >= 20 else []
            
            if not older_values:
                continue
            
            # Statistical anomaly detection
            recent_mean = np.mean(recent_values)
            older_mean = np.mean(older_values)
            older_std = np.std(older_values)
            
            if older_std > 0:
                z_score = abs(recent_mean - older_mean) / older_std
                
                if z_score > 2.5:  # Threshold for anomaly
                    anomalies.append({
                        'sensor_id': sensor_id,
                        'type': 'statistical_anomaly',
                        'z_score': z_score,
                        'recent_mean': recent_mean,
                        'historical_mean': older_mean,
                        'timestamp': time.time()
                    })
        
        return anomalies
    
    def predict_next_reading(self, sensor_id: str, steps_ahead: int = 1) -> Optional[float]:
        """Predict next sensor reading using simple linear regression"""
        if sensor_id not in self.data_buffers or len(self.data_buffers[sensor_id]) < 5:
            return None
        
        # Get recent values
        recent_data = list(self.data_buffers[sensor_id])[-10:]
        values = [data.value for data in recent_data]
        timestamps = [data.timestamp for data in recent_data]
        
        if len(values) < 2:
            return None
        
        # Simple linear regression
        x = np.array(range(len(values)))
        y = np.array(values)
        
        # Fit line
        coeffs = np.polyfit(x, y, 1)
        
        # Predict next value
        next_x = len(values) + steps_ahead - 1
        predicted_value = coeffs[0] * next_x + coeffs[1]
        
        return predicted_value
    
    def export_data(self, filename: str, format: str = 'json'):
        """Export sensor data"""
        export_data = {}
        
        for sensor_id, buffer in self.data_buffers.items():
            export_data[sensor_id] = [
                {
                    'value': data.value,
                    'unit': data.unit,
                    'timestamp': data.timestamp,
                    'confidence': data.confidence
                }
                for data in buffer
            ]
        
        if format == 'json':
            with open(filename, 'w') as f:
                json.dump(export_data, f, indent=2)
        else:
            # Add other formats as needed
            pass
        
        self.logger.info(f"Data exported to {filename}")
    
    def cleanup(self):
        """Cleanup resources"""
        self.data_buffers.clear()
        self.fusion_filters.clear()
        self.logger.info("Sensor fusion system cleaned up")

# Example usage
if __name__ == "__main__":
    try:
        # Initialize fusion system
        fusion = SensorFusion()
        
        # Simulate sensor data
        current_time = time.time()
        
        for i in range(50):
            # Simulate ultrasonic sensor readings
            front_distance = 100 + 10 * np.sin(i * 0.1) + np.random.normal(0, 2)
            left_distance = 80 + 15 * np.cos(i * 0.1) + np.random.normal(0, 3)
            right_distance = 120 + 8 * np.sin(i * 0.15) + np.random.normal(0, 2.5)
            
            # Add sensor data
            fusion.add_sensor_data(SensorData(
                sensor_id='ultrasonic_front',
                sensor_type='distance',
                value=front_distance,
                unit='cm',
                timestamp=current_time + i * 0.1,
                confidence=0.9
            ))
            
            fusion.add_sensor_data(SensorData(
                sensor_id='ultrasonic_left',
                sensor_type='distance',
                value=left_distance,
                unit='cm',
                timestamp=current_time + i * 0.1,
                confidence=0.85
            ))
            
            fusion.add_sensor_data(SensorData(
                sensor_id='ultrasonic_right',
                sensor_type='distance',
                value=right_distance,
                unit='cm',
                timestamp=current_time + i * 0.1,
                confidence=0.88
            ))
            
            # Fuse data
            fused = fusion.fuse_all_sensors()
            
            if 'distance' in fused:
                distance_fusion = fused['distance']
                print(f"Fused distance: {distance_fusion.value:.2f}cm (confidence: {distance_fusion.confidence:.2f})")
            
            time.sleep(0.05)
        
        # Get statistics
        stats = fusion.get_fusion_statistics()
        print("\nFusion Statistics:")
        for sensor_id, stat in stats.items():
            print(f"{sensor_id}: mean={stat['mean']:.2f}, std={stat['std']:.2f}")
        
        # Detect anomalies
        anomalies = fusion.detect_anomalies()
        if anomalies:
            print(f"\nDetected {len(anomalies)} anomalies")
        
        fusion.cleanup()
        
    except KeyboardInterrupt:
        print("Stopping...")
        fusion.cleanup()
    except Exception as e:
        print(f"Error: {str(e)}")
