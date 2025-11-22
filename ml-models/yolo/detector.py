from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from ultralytics import YOLO
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load YOLO model
model = YOLO('yolov8n.pt')  # Using YOLOv8 nano for speed

def decode_base64_image(base64_string):
    """Decode base64 image string to numpy array"""
    try:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        logger.error(f"Error decoding image: {str(e)}")
        return None

@app.route('/detect', methods=['POST'])
def detect_objects():
    """Detect objects in an image using YOLO"""
    try:
        data = request.get_json()
        image_data = data.get('image')
        confidence_threshold = data.get('confidence_threshold', 0.75)
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode image
        img = decode_base64_image(image_data)
        if img is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        # Run inference
        results = model(img, conf=confidence_threshold)
        
        # Parse results
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                class_name = model.names[cls]
                
                detection = {
                    'object_type': class_name,
                    'confidence': conf,
                    'bbox_x': int(x1),
                    'bbox_y': int(y1),
                    'bbox_width': int(x2 - x1),
                    'bbox_height': int(y2 - y1),
                }
                detections.append(detection)
        
        logger.info(f"Detected {len(detections)} objects")
        
        return jsonify({
            'success': True,
            'detections': detections,
            'count': len(detections)
        })
        
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'YOLOv8n'
    })

if __name__ == '__main__':
    logger.info("Starting YOLO detection server...")
    app.run(host='0.0.0.0', port=5001, debug=False)