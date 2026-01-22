import RPi.GPIO as GPIO
import time
import logging
from typing import Dict, List, Optional, Tuple
import threading
import queue
from dataclasses import dataclass

@dataclass
class SensorReading:
    """Sensor reading data structure"""
    distance: float
    timestamp: float
    sensor_id: str
    unit: str = "cm"

class UltrasonicSensor:
    """Ultrasonic distance sensor for obstacle detection"""
    
    def __init__(self, trigger_pin: int, echo_pin: int, 
                 sensor_id: str = "default", max_distance: float = 400.0):
        """
        Initialize ultrasonic sensor
        
        Args:
            trigger_pin: GPIO pin for trigger
            echo_pin: GPIO pin for echo
            sensor_id: Unique identifier for sensor
            max_distance: Maximum measurable distance in cm
        """
        self.trigger_pin = trigger_pin
        self.echo_pin = echo_pin
        self.sensor_id = sensor_id
        self.max_distance = max_distance
        
        # GPIO setup
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(trigger_pin, GPIO.OUT)
        GPIO.setup(echo_pin, GPIO.IN)
        
        # Sensor state
        self.is_active = False
        self.reading_thread = None
        self.reading_queue = queue.Queue()
        
        # Calibration
        self.speed_of_sound = 34300  # cm/s at 20°C
        self.temperature_offset = 0
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        self.logger.info(f"Ultrasonic sensor {sensor_id} initialized on pins {trigger_pin}/{echo_pin}")
    
    def measure_distance(self) -> Optional[float]:
        """Measure distance using ultrasonic sensor"""
        try:
            # Send trigger pulse
            GPIO.output(self.trigger_pin, GPIO.LOW)
            time.sleep(0.000002)  # 2 microseconds
            GPIO.output(self.trigger_pin, GPIO.HIGH)
            time.sleep(0.00001)   # 10 microseconds
            GPIO.output(self.trigger_pin, GPIO.LOW)
            
            # Wait for echo start
            timeout = time.time() + 0.04  # 40ms timeout (max distance ~400cm)
            
            while GPIO.input(self.echo_pin) == 0:
                if time.time() > timeout:
                    return None
            
            pulse_start = time.time()
            
            # Wait for echo end
            timeout = time.time() + 0.04
            
            while GPIO.input(self.echo_pin) == 1:
                if time.time() > timeout:
                    return None
            
            pulse_end = time.time()
            
            # Calculate distance
            pulse_duration = pulse_end - pulse_start
            distance = (pulse_duration * self.speed_of_sound) / 2
            
            # Apply temperature compensation
            distance += self.temperature_offset
            
            # Filter invalid readings
            if distance < 0 or distance > self.max_distance:
                return None
            
            return distance
            
        except Exception as e:
            self.logger.error(f"Error measuring distance: {str(e)}")
            return None
    
    def get_reading(self) -> Optional[SensorReading]:
        """Get a single sensor reading"""
        distance = self.measure_distance()
        
        if distance is not None:
            return SensorReading(
                distance=distance,
                timestamp=time.time(),
                sensor_id=self.sensor_id
            )
        
        return None
    
    def start_continuous_reading(self, interval: float = 0.1):
        """Start continuous distance readings"""
        if self.is_active:
            return
        
        self.is_active = True
        self.reading_thread = threading.Thread(
            target=self._continuous_reading_worker,
            args=(interval,)
        )
        self.reading_thread.daemon = True
        self.reading_thread.start()
        
        self.logger.info(f"Started continuous reading for sensor {self.sensor_id}")
    
    def _continuous_reading_worker(self, interval: float):
        """Worker thread for continuous readings"""
        while self.is_active:
            reading = self.get_reading()
            
            if reading:
                self.reading_queue.put(reading)
            
            time.sleep(interval)
    
    def stop_continuous_reading(self):
        """Stop continuous readings"""
        self.is_active = False
        
        if self.reading_thread and self.reading_thread.is_alive():
            self.reading_thread.join(timeout=1)
        
        self.logger.info(f"Stopped continuous reading for sensor {self.sensor_id}")
    
    def get_latest_reading(self) -> Optional[SensorReading]:
        """Get the latest reading from queue"""
        try:
            return self.reading_queue.get_nowait()
        except queue.Empty:
            return None
    
    def get_average_reading(self, count: int = 5) -> Optional[float]:
        """Get average of multiple readings"""
        readings = []
        
        for _ in range(count):
            distance = self.measure_distance()
            if distance is not None:
                readings.append(distance)
            time.sleep(0.01)  # Small delay between readings
        
        if readings:
            return sum(readings) / len(readings)
        
        return None
    
    def calibrate(self, known_distance: float):
        """Calibrate sensor with known distance"""
        measured = self.get_average_reading(10)
        
        if measured is not None:
            self.temperature_offset = known_distance - measured
            self.logger.info(f"Sensor {self.sensor_id} calibrated. Offset: {self.temperature_offset:.2f}cm")
            return True
        
        return False
    
    def set_temperature_compensation(self, temperature_celsius: float):
        """Set temperature compensation"""
        # Speed of sound varies with temperature
        # v = 331.3 + (0.606 * T) m/s
        speed_mps = 331.3 + (0.606 * temperature_celsius)
        self.speed_of_sound = speed_mps * 100  # Convert to cm/s
        
        self.logger.info(f"Temperature compensation set for {temperature_celsius}°C")
    
    def get_sensor_info(self) -> Dict:
        """Get sensor information"""
        return {
            'sensor_id': self.sensor_id,
            'trigger_pin': self.trigger_pin,
            'echo_pin': self.echo_pin,
            'max_distance': self.max_distance,
            'speed_of_sound': self.speed_of_sound,
            'temperature_offset': self.temperature_offset,
            'is_active': self.is_active
        }
    
    def cleanup(self):
        """Cleanup GPIO resources"""
        try:
            self.stop_continuous_reading()
            GPIO.cleanup([self.trigger_pin, self.echo_pin])
            self.logger.info(f"Sensor {self.sensor_id} cleaned up")
        except Exception as e:
            self.logger.error(f"Error cleaning up sensor {self.sensor_id}: {str(e)}")

class MultiSensorArray:
    """Array of multiple ultrasonic sensors"""
    
    def __init__(self, sensor_configs: List[Dict]):
        """
        Initialize sensor array
        
        Args:
            sensor_configs: List of sensor configurations
                           [{'trigger_pin': int, 'echo_pin': int, 'sensor_id': str}]
        """
        self.sensors = {}
        self.is_active = False
        
        # Create sensors
        for config in sensor_configs:
            sensor_id = config.get('sensor_id', f"sensor_{len(self.sensors)}")
            sensor = UltrasonicSensor(
                trigger_pin=config['trigger_pin'],
                echo_pin=config['echo_pin'],
                sensor_id=sensor_id,
                max_distance=config.get('max_distance', 400.0)
            )
            self.sensors[sensor_id] = sensor
        
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"Initialized sensor array with {len(self.sensors)} sensors")
    
    def start_all_sensors(self, interval: float = 0.1):
        """Start all sensors"""
        for sensor in self.sensors.values():
            sensor.start_continuous_reading(interval)
        
        self.is_active = True
        self.logger.info("All sensors started")
    
    def stop_all_sensors(self):
        """Stop all sensors"""
        for sensor in self.sensors.values():
            sensor.stop_continuous_reading()
        
        self.is_active = False
        self.logger.info("All sensors stopped")
    
    def get_all_readings(self) -> Dict[str, SensorReading]:
        """Get latest readings from all sensors"""
        readings = {}
        
        for sensor_id, sensor in self.sensors.items():
            reading = sensor.get_latest_reading()
            if reading:
                readings[sensor_id] = reading
        
        return readings
    
    def get_closest_obstacle(self) -> Optional[Tuple[str, SensorReading]]:
        """Get the closest obstacle from all sensors"""
        readings = self.get_all_readings()
        
        if not readings:
            return None
        
        # Find closest reading
        closest_sensor = None
        closest_reading = None
        min_distance = float('inf')
        
        for sensor_id, reading in readings.items():
            if reading.distance < min_distance:
                min_distance = reading.distance
                closest_sensor = sensor_id
                closest_reading = reading
        
        if closest_sensor:
            return (closest_sensor, closest_reading)
        
        return None
    
    def get_obstacle_map(self) -> Dict[str, float]:
        """Get obstacle distance map"""
        readings = self.get_all_readings()
        
        obstacle_map = {}
        for sensor_id, reading in readings.items():
            obstacle_map[sensor_id] = reading.distance
        
        return obstacle_map
    
    def calibrate_all_sensors(self, known_distances: Dict[str, float]):
        """Calibrate all sensors"""
        results = {}
        
        for sensor_id, known_distance in known_distances.items():
            if sensor_id in self.sensors:
                success = self.sensors[sensor_id].calibrate(known_distance)
                results[sensor_id] = success
        
        return results
    
    def set_temperature_for_all(self, temperature_celsius: float):
        """Set temperature compensation for all sensors"""
        for sensor in self.sensors.values():
            sensor.set_temperature_compensation(temperature_celsius)
    
    def get_sensor_status(self) -> Dict[str, Dict]:
        """Get status of all sensors"""
        status = {}
        
        for sensor_id, sensor in self.sensors.items():
            status[sensor_id] = sensor.get_sensor_info()
        
        return status
    
    def cleanup(self):
        """Cleanup all sensors"""
        self.stop_all_sensors()
        
        for sensor in self.sensors.values():
            sensor.cleanup()
        
        self.logger.info("Sensor array cleaned up")

# Example usage
if __name__ == "__main__":
    try:
        # Single sensor example
        sensor = UltrasonicSensor(trigger_pin=23, echo_pin=24, sensor_id="front")
        
        # Single reading
        reading = sensor.get_reading()
        if reading:
            print(f"Distance: {reading.distance:.2f}cm")
        
        # Continuous reading
        sensor.start_continuous_reading(interval=0.1)
        
        for i in range(10):
            latest = sensor.get_latest_reading()
            if latest:
                print(f"Reading {i+1}: {latest.distance:.2f}cm")
            time.sleep(0.5)
        
        sensor.stop_continuous_reading()
        
        # Multi-sensor array example
        sensor_configs = [
            {'trigger_pin': 23, 'echo_pin': 24, 'sensor_id': 'front'},
            {'trigger_pin': 17, 'echo_pin': 27, 'sensor_id': 'left'},
            {'trigger_pin': 5, 'echo_pin': 6, 'sensor_id': 'right'}
        ]
        
        array = MultiSensorArray(sensor_configs)
        array.start_all_sensors(interval=0.1)
        
        for i in range(10):
            readings = array.get_all_readings()
            closest = array.get_closest_obstacle()
            
            print(f"Readings {i+1}: {readings}")
            if closest:
                sensor_id, reading = closest
                print(f"Closest: {sensor_id} at {reading.distance:.2f}cm")
            
            time.sleep(0.5)
        
        array.cleanup()
        
    except KeyboardInterrupt:
        print("Stopping...")
        GPIO.cleanup()
    except Exception as e:
        print(f"Error: {str(e)}")
        GPIO.cleanup()
