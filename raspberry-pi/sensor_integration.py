import time
import logging
try:
    import RPi.GPIO as GPIO
    import Adafruit_DHT
except ImportError:
    logging.warning("GPIO libraries not available. Running in simulation mode.")
    GPIO = None
    Adafruit_DHT = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sensor pins
DHT_SENSOR = Adafruit_DHT.DHT22 if Adafruit_DHT else None
DHT_PIN = 4
TRIG_PIN = 23
ECHO_PIN = 24

class SensorManager:
    """Manage all connected sensors"""
    
    def __init__(self):
        """Initialize sensors"""
        if GPIO:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(TRIG_PIN, GPIO.OUT)
            GPIO.setup(ECHO_PIN, GPIO.IN)
            logger.info("GPIO sensors initialized")
        else:
            logger.info("Running in simulation mode")
    
    def read_temperature_humidity(self):
        """Read temperature and humidity from DHT22 sensor"""
        if DHT_SENSOR:
            try:
                humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
                if humidity is not None and temperature is not None:
                    return {
                        'temperature': round(temperature, 1),
                        'humidity': round(humidity, 1)
                    }
            except Exception as e:
                logger.error(f"DHT sensor error: {str(e)}")
        
        # Simulation values
        return {
            'temperature': 24.5,
            'humidity': 62
        }
    
    def read_proximity(self):
        """Read distance from ultrasonic sensor"""
        if GPIO:
            try:
                # Trigger pulse
                GPIO.output(TRIG_PIN, True)
                time.sleep(0.00001)
                GPIO.output(TRIG_PIN, False)
                
                # Measure echo
                pulse_start = time.time()
                pulse_end = time.time()
                
                while GPIO.input(ECHO_PIN) == 0:
                    pulse_start = time.time()
                
                while GPIO.input(ECHO_PIN) == 1:
                    pulse_end = time.time()
                
                pulse_duration = pulse_end - pulse_start
                distance = pulse_duration * 17150
                distance = round(distance, 2)
                
                return {'proximity': distance / 100}  # Convert to meters
            except Exception as e:
                logger.error(f"Ultrasonic sensor error: {str(e)}")
        
        # Simulation value
        return {'proximity': 1.2}
    
    def get_all_sensor_data(self):
        """Get data from all sensors"""
        data = {}
        data.update(self.read_temperature_humidity())
        data.update(self.read_proximity())
        return data
    
    def cleanup(self):
        """Cleanup GPIO"""
        if GPIO:
            GPIO.cleanup()
            logger.info("GPIO cleaned up")

# Create global sensor manager instance
sensor_manager = SensorManager()

if __name__ == "__main__":
    try:
        while True:
            data = sensor_manager.get_all_sensor_data()
            logger.info(f"Sensor data: {data}")
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Stopping sensor readings")
        sensor_manager.cleanup()