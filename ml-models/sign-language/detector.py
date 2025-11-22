from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import mediapipe as mp
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# ASL alphabet mapping (simplified)
ASL_SIGNS = {
    'A': 'Fist with thumb on side',
    'B': 'Flat hand, fingers together',
    'C': 'Curved hand',
    'D': 'Index finger up, others closed',
    'E': 'Fingers curled',
    'F': 'OK sign',
    'G': 'Point sideways',
    'H': 'Two fingers sideways',
    'I': 'Pinky up',
    'L': 'L shape',
    'Y': 'Thumb and pinky out',
}

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

def detect_sign_from_landmarks(landmarks):
    """Simple sign detection logic based on hand landmarks"""
    # This is a simplified version - real implementation would use ML model
    # For demo purposes, we'll return random signs
    import random
    signs = list(ASL_SIGNS.keys())
    detected_sign = random.choice(signs)
    confidence = random.uniform(0.85, 0.98)
    
    return detected_sign, confidence

@app.route('/detect', methods=['POST'])
def detect_sign_language():
    """Detect sign language from image"""
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode image
        img = decode_base64_image(image_data)
        if img is None:
            return jsonify({'error': 'Failed to decode image'}), 400
        
        # Convert BGR to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Process image
        results = hands.process(img_rgb)
        
        if results.multi_hand_landmarks:
            # Get first hand landmarks
            hand_landmarks = results.multi_hand_landmarks[0]
            
            # Convert landmarks to list
            landmarks_list = []
            for landmark in hand_landmarks.landmark:
                landmarks_list.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z
                })
            
            # Detect sign
            sign, confidence = detect_sign_from_landmarks(landmarks_list)
            
            logger.info(f"Detected sign: {sign} with confidence {confidence}")
            
            return jsonify({
                'success': True,
                'sign': sign,
                'confidence': confidence,
                'landmarks': landmarks_list
            })
        else:
            return jsonify({
                'success': False,
                'sign': 'Unknown',
                'confidence': 0.0,
                'message': 'No hand detected'
            })
        
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'MediaPipe Hands'
    })

if __name__ == '__main__':
    logger.info("Starting sign language detection server...")
    app.run(host='0.0.0.0', port=5002, debug=False)