import numpy as np
import time
import logging
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

@dataclass
class CalibrationPoint:
    """Calibration point data"""
    measured_value: float
    true_value: float
    timestamp: float
    sensor_id: str
    environmental_conditions: Dict = None

@dataclass
class CalibrationResult:
    """Calibration result"""
    sensor_id: str
    calibration_type: str
    parameters: Dict
    accuracy_score: float
    rmse: float
    mae: float
    r_squared: float
    calibration_points: int
    timestamp: float

class SensorCalibration:
    """Sensor calibration system"""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize calibration system"""
        self.calibration_data = {}
        self.calibration_results = {}
        self.calibration_points = {}
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Load configuration
        self.config = self.load_config(config_path)
        
        self.logger.info("Sensor calibration system initialized")
    
    def load_config(self, config_path: Optional[str]) -> Dict:
        """Load calibration configuration"""
        default_config = {
            'sensors': {
                'ultrasonic_front': {
                    'type': 'distance',
                    'calibration_method': 'linear',
                    'required_points': 5,
                    'tolerance': 2.0  # cm
                },
                'ultrasonic_left': {
                    'type': 'distance',
                    'calibration_method': 'linear',
                    'required_points': 5,
                    'tolerance': 2.0
                },
                'ultrasonic_right': {
                    'type': 'distance',
                    'calibration_method': 'linear',
                    'required_points': 5,
                    'tolerance': 2.0
                }
            },
            'calibration_methods': {
                'linear': {
                    'fit_method': 'least_squares',
                    'outlier_removal': True,
                    'outlier_threshold': 2.0
                },
                'polynomial': {
                    'degree': 2,
                    'fit_method': 'least_squares',
                    'outlier_removal': True,
                    'outlier_threshold': 2.0
                },
                'exponential': {
                    'fit_method': 'nonlinear_least_squares',
                    'outlier_removal': True,
                    'outlier_threshold': 2.0
                }
            }
        }
        
        if config_path and Path(config_path).exists():
            try:
                with open(config_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                self.logger.warning(f"Could not load config: {str(e)}")
        
        return default_config
    
    def add_calibration_point(self, sensor_id: str, measured_value: float, 
                             true_value: float, environmental_conditions: Dict = None):
        """Add calibration point"""
        if sensor_id not in self.calibration_points:
            self.calibration_points[sensor_id] = []
        
        point = CalibrationPoint(
            measured_value=measured_value,
            true_value=true_value,
            timestamp=time.time(),
            sensor_id=sensor_id,
            environmental_conditions=environmental_conditions or {}
        )
        
        self.calibration_points[sensor_id].append(point)
        
        self.logger.info(f"Added calibration point for {sensor_id}: measured={measured_value}, true={true_value}")
    
    def calibrate_sensor(self, sensor_id: str, method: Optional[str] = None) -> Optional[CalibrationResult]:
        """Calibrate sensor using collected points"""
        if sensor_id not in self.calibration_points:
            self.logger.error(f"No calibration points for sensor {sensor_id}")
            return None
        
        points = self.calibration_points[sensor_id]
        sensor_config = self.config['sensors'].get(sensor_id, {})
        
        # Check minimum points required
        required_points = sensor_config.get('required_points', 5)
        if len(points) < required_points:
            self.logger.error(f"Insufficient calibration points for {sensor_id}: {len(points)} < {required_points}")
            return None
        
        # Determine calibration method
        if method is None:
            method = sensor_config.get('calibration_method', 'linear')
        
        # Extract data
        measured_values = np.array([p.measured_value for p in points])
        true_values = np.array([p.true_value for p in points])
        
        # Remove outliers if enabled
        method_config = self.config['calibration_methods'].get(method, {})
        if method_config.get('outlier_removal', True):
            measured_values, true_values = self._remove_outliers(
                measured_values, true_values, 
                method_config.get('outlier_threshold', 2.0)
            )
        
        # Perform calibration based on method
        if method == 'linear':
            result = self._calibrate_linear(sensor_id, measured_values, true_values)
        elif method == 'polynomial':
            result = self._calibrate_polynomial(sensor_id, measured_values, true_values, method_config)
        elif method == 'exponential':
            result = self._calibrate_exponential(sensor_id, measured_values, true_values)
        else:
            self.logger.error(f"Unknown calibration method: {method}")
            return None
        
        if result:
            self.calibration_results[sensor_id] = result
            self.logger.info(f"Calibration completed for {sensor_id}: RMSE={result.rmse:.3f}")
        
        return result
    
    def _remove_outliers(self, measured_values: np.ndarray, true_values: np.ndarray, 
                        threshold: float = 2.0) -> Tuple[np.ndarray, np.ndarray]:
        """Remove outliers using z-score method"""
        # Calculate residuals
        if len(measured_values) > 1:
            # Simple linear fit to get residuals
            coeffs = np.polyfit(measured_values, true_values, 1)
            predicted = np.polyval(coeffs, measured_values)
            residuals = np.abs(true_values - predicted)
            
            # Calculate z-scores
            mean_residual = np.mean(residuals)
            std_residual = np.std(residuals)
            
            if std_residual > 0:
                z_scores = residuals / std_residual
                
                # Keep points within threshold
                mask = z_scores <= threshold
                return measured_values[mask], true_values[mask]
        
        return measured_values, true_values
    
    def _calibrate_linear(self, sensor_id: str, measured_values: np.ndarray, 
                        true_values: np.ndarray) -> CalibrationResult:
        """Linear calibration (y = ax + b)"""
        # Linear regression
        coeffs = np.polyfit(measured_values, true_values, 1)
        slope, intercept = coeffs
        
        # Predictions
        predicted = np.polyval(coeffs, measured_values)
        
        # Calculate metrics
        rmse = np.sqrt(np.mean((true_values - predicted) ** 2))
        mae = np.mean(np.abs(true_values - predicted))
        
        # R-squared
        ss_res = np.sum((true_values - predicted) ** 2)
        ss_tot = np.sum((true_values - np.mean(true_values)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        # Accuracy score (inverse of normalized RMSE)
        accuracy_score = max(0, 1 - (rmse / np.mean(true_values))) if np.mean(true_values) > 0 else 0
        
        return CalibrationResult(
            sensor_id=sensor_id,
            calibration_type='linear',
            parameters={'slope': slope, 'intercept': intercept},
            accuracy_score=accuracy_score,
            rmse=rmse,
            mae=mae,
            r_squared=r_squared,
            calibration_points=len(measured_values),
            timestamp=time.time()
        )
    
    def _calibrate_polynomial(self, sensor_id: str, measured_values: np.ndarray, 
                            true_values: np.ndarray, config: Dict) -> CalibrationResult:
        """Polynomial calibration"""
        degree = config.get('degree', 2)
        
        # Polynomial regression
        coeffs = np.polyfit(measured_values, true_values, degree)
        
        # Predictions
        predicted = np.polyval(coeffs, measured_values)
        
        # Calculate metrics
        rmse = np.sqrt(np.mean((true_values - predicted) ** 2))
        mae = np.mean(np.abs(true_values - predicted))
        
        # R-squared
        ss_res = np.sum((true_values - predicted) ** 2)
        ss_tot = np.sum((true_values - np.mean(true_values)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        # Accuracy score
        accuracy_score = max(0, 1 - (rmse / np.mean(true_values))) if np.mean(true_values) > 0 else 0
        
        return CalibrationResult(
            sensor_id=sensor_id,
            calibration_type='polynomial',
            parameters={'coefficients': coeffs.tolist(), 'degree': degree},
            accuracy_score=accuracy_score,
            rmse=rmse,
            mae=mae,
            r_squared=r_squared,
            calibration_points=len(measured_values),
            timestamp=time.time()
        )
    
    def _calibrate_exponential(self, sensor_id: str, measured_values: np.ndarray, 
                             true_values: np.ndarray) -> CalibrationResult:
        """Exponential calibration (y = a * exp(b * x) + c)"""
        try:
            from scipy.optimize import curve_fit
            
            def exponential_func(x, a, b, c):
                return a * np.exp(b * x) + c
            
            # Initial guess
            p0 = [1.0, 0.01, 0.0]
            
            # Fit exponential function
            params, _ = curve_fit(exponential_func, measured_values, true_values, p0=p0, maxfev=10000)
            
            # Predictions
            predicted = exponential_func(measured_values, *params)
            
            # Calculate metrics
            rmse = np.sqrt(np.mean((true_values - predicted) ** 2))
            mae = np.mean(np.abs(true_values - predicted))
            
            # R-squared
            ss_res = np.sum((true_values - predicted) ** 2)
            ss_tot = np.sum((true_values - np.mean(true_values)) ** 2)
            r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
            
            # Accuracy score
            accuracy_score = max(0, 1 - (rmse / np.mean(true_values))) if np.mean(true_values) > 0 else 0
            
            return CalibrationResult(
                sensor_id=sensor_id,
                calibration_type='exponential',
                parameters={'a': params[0], 'b': params[1], 'c': params[2]},
                accuracy_score=accuracy_score,
                rmse=rmse,
                mae=mae,
                r_squared=r_squared,
                calibration_points=len(measured_values),
                timestamp=time.time()
            )
            
        except ImportError:
            self.logger.error("scipy not available for exponential calibration")
            return None
        except Exception as e:
            self.logger.error(f"Exponential calibration failed: {str(e)}")
            return None
    
    def apply_calibration(self, sensor_id: str, measured_value: float) -> Optional[float]:
        """Apply calibration to measured value"""
        if sensor_id not in self.calibration_results:
            self.logger.warning(f"No calibration available for sensor {sensor_id}")
            return measured_value
        
        result = self.calibration_results[sensor_id]
        params = result.parameters
        
        if result.calibration_type == 'linear':
            # y = ax + b
            return params['slope'] * measured_value + params['intercept']
        elif result.calibration_type == 'polynomial':
            # Polynomial
            coeffs = params['coefficients']
            return np.polyval(coeffs, measured_value)
        elif result.calibration_type == 'exponential':
            # y = a * exp(b * x) + c
            return params['a'] * np.exp(params['b'] * measured_value) + params['c']
        else:
            return measured_value
    
    def validate_calibration(self, sensor_id: str, validation_points: List[Tuple[float, float]]) -> Dict:
        """Validate calibration with test points"""
        if sensor_id not in self.calibration_results:
            return {'error': 'No calibration available'}
        
        errors = []
        
        for measured, true_value in validation_points:
            calibrated = self.apply_calibration(sensor_id, measured)
            if calibrated is not None:
                error = abs(calibrated - true_value)
                errors.append(error)
        
        if errors:
            return {
                'sensor_id': sensor_id,
                'validation_points': len(validation_points),
                'mean_error': np.mean(errors),
                'max_error': np.max(errors),
                'min_error': np.min(errors),
                'std_error': np.std(errors),
                'passed': np.mean(errors) <= self.config['sensors'][sensor_id].get('tolerance', 2.0)
            }
        else:
            return {'error': 'No valid validation points'}
    
    def get_calibration_summary(self) -> Dict:
        """Get summary of all calibrations"""
        summary = {}
        
        for sensor_id, result in self.calibration_results.items():
            summary[sensor_id] = {
                'calibration_type': result.calibration_type,
                'accuracy_score': result.accuracy_score,
                'rmse': result.rmse,
                'mae': result.mae,
                'r_squared': result.r_squared,
                'calibration_points': result.calibration_points,
                'timestamp': result.timestamp,
                'parameters': result.parameters
            }
        
        return summary
    
    def export_calibration(self, filename: str):
        """Export calibration results"""
        export_data = {
            'calibration_results': {
                sensor_id: asdict(result) 
                for sensor_id, result in self.calibration_results.items()
            },
            'calibration_points': {
                sensor_id: [asdict(point) for point in points]
                for sensor_id, points in self.calibration_points.items()
            },
            'export_timestamp': time.time()
        }
        
        with open(filename, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        self.logger.info(f"Calibration data exported to {filename}")
    
    def import_calibration(self, filename: str):
        """Import calibration results"""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            
            # Import calibration results
            if 'calibration_results' in data:
                for sensor_id, result_data in data['calibration_results'].items():
                    self.calibration_results[sensor_id] = CalibrationResult(**result_data)
            
            # Import calibration points
            if 'calibration_points' in data:
                for sensor_id, points_data in data['calibration_points'].items():
                    self.calibration_points[sensor_id] = [
                        CalibrationPoint(**point_data) for point_data in points_data
                    ]
            
            self.logger.info(f"Calibration data imported from {filename}")
            
        except Exception as e:
            self.logger.error(f"Failed to import calibration: {str(e)}")
    
    def clear_calibration_data(self, sensor_id: Optional[str] = None):
        """Clear calibration data"""
        if sensor_id:
            if sensor_id in self.calibration_points:
                del self.calibration_points[sensor_id]
            if sensor_id in self.calibration_results:
                del self.calibration_results[sensor_id]
            self.logger.info(f"Cleared calibration data for {sensor_id}")
        else:
            self.calibration_points.clear()
            self.calibration_results.clear()
            self.logger.info("Cleared all calibration data")

# Example usage
if __name__ == "__main__":
    try:
        # Initialize calibration system
        calibrator = SensorCalibration()
        
        # Simulate calibration data for ultrasonic sensor
        # True distance vs measured distance (with some systematic error)
        true_distances = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        measured_distances = [12, 22, 31, 39, 48, 58, 67, 77, 86, 95]  # Slight systematic error
        
        # Add calibration points
        for true_dist, measured_dist in zip(true_distances, measured_distances):
            calibrator.add_calibration_point(
                sensor_id='ultrasonic_front',
                measured_value=measured_dist,
                true_value=true_dist,
                environmental_conditions={'temperature': 20.0}
            )
        
        # Calibrate sensor
        result = calibrator.calibrate_sensor('ultrasonic_front')
        
        if result:
            print(f"Calibration completed for {result.sensor_id}")
            print(f"Type: {result.calibration_type}")
            print(f"RMSE: {result.rmse:.3f}")
            print(f"R²: {result.r_squared:.3f}")
            print(f"Parameters: {result.parameters}")
        
        # Test calibration
        test_measured = 55
        calibrated = calibrator.apply_calibration('ultrasonic_front', test_measured)
        print(f"Original: {test_measured}cm -> Calibrated: {calibrated:.2f}cm")
        
        # Validate calibration
        validation_points = [(25, 25), (45, 45), (75, 75)]
        validation_result = calibrator.validate_calibration('ultrasonic_front', validation_points)
        print(f"Validation: {validation_result}")
        
        # Export calibration
        calibrator.export_calibration('calibration_data.json')
        
        calibrator.clear_calibration_data()
        
    except Exception as e:
        print(f"Error: {str(e)}")
