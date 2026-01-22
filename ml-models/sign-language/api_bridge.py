from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import cv2
from inference import ISLDetector
import logging

app = Flask(__name__)
CORS(app)

# Initialize detector
detector = ISLDetector()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model': 'isl_detector'})

@app.route('/detect', methods=['POST'])
def detect_sign():
    """Detect ISL sign from image"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Detect sign
        result = detector.predict(image)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/detect_stream', methods=['POST'])
def detect_stream():
    """Stream detection endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'frame' not in data:
            return jsonify({'error': 'No frame provided'}), 400
        
        # Decode base64 frame
        frame_data = base64.b64decode(data['frame'])
        nparr = np.frombuffer(frame_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid frame data'}), 400
        
        # Detect sign
        result = detector.predict(frame)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Stream detection error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/labels', methods=['GET'])
def get_labels():
    """Get available sign labels"""
    try:
        labels = detector.label_encoder.classes_.tolist()
        return jsonify({'labels': labels})
    except Exception as e:
        logger.error(f"Labels error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.teardown_appcontext
def cleanup(error):
    """Cleanup resources"""
    pass

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5002, debug=True)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        detector.cleanup()