import asyncio
import websockets
import json
import base64
import cv2
from picamera2 import Picamera2
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize camera
picam2 = Picamera2()
config = picam2.create_preview_configuration(main={"size": (640, 480)})
picam2.configure(config)
picam2.start()

# Sensor data simulation (replace with actual sensor readings)
def get_sensor_data():
    """Get sensor data from connected sensors"""
    return {
        'temperature': 24.5,
        'humidity': 62,
        'proximity': 1.2
    }

async def stream_handler(websocket, path):
    """Handle WebSocket connections for video streaming"""
    logger.info(f"New client connected from {websocket.remote_address}")
    
    try:
        while True:
            # Capture frame
            frame = picam2.capture_array()
            
            # Convert to JPEG
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            
            # Encode to base64
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Get sensor data
            sensor_data = get_sensor_data()
            
            # Create message
            message = {
                'type': 'stream',
                'data': {
                    'frame': frame_base64,
                    'timestamp': asyncio.get_event_loop().time(),
                    'sensor_data': sensor_data
                }
            }
            
            # Send to client
            await websocket.send(json.dumps(message))
            
            # Control frame rate (30 FPS)
            await asyncio.sleep(1/30)
            
    except websockets.exceptions.ConnectionClosed:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"Streaming error: {str(e)}")

async def main():
    """Start WebSocket server"""
    logger.info("Starting Raspberry Pi camera stream server on ws://0.0.0.0:8765")
    
    async with websockets.serve(stream_handler, "0.0.0.0", 8765):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
        picam2.stop()
        