import numpy as np
import tensorflow as tf
import joblib
import cv2
import mediapipe as mp
from typing import List, Tuple, Dict

class ISLDetector:
    def __init__(self, model_path='isl_mlp_model.h5', 
                 label_encoder_path='label_encoder.pkl'):
        """Initialize ISL detector"""
        self.model = tf.keras.models.load_model(model_path)
        self.label_encoder = joblib.load(label_encoder_path)
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
    def extract_landmarks(self, image: np.ndarray) -> np.ndarray:
        """Extract hand landmarks from image"""
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.hands.process(image_rgb)
        
        landmarks = []
        
        if results.multi_hand_landmarks:
            # Process all detected hands
            for hand_landmarks in results.multi_hand_landmarks:
                hand_data = []
                for landmark in hand_landmarks.landmark:
                    hand_data.extend([landmark.x, landmark.y, landmark.z])
                
                # Pad or truncate to fixed size
                if len(hand_data) < 63:  # 21 landmarks * 3 coordinates
                    hand_data.extend([0] * (63 - len(hand_data)))
                else:
                    hand_data = hand_data[:63]
                
                landmarks.append(hand_data)
        
        # If no hands detected, return zeros
        if not landmarks:
            return np.zeros(63)
        
        # If multiple hands, take the first one (can be modified for multi-hand)
        return np.array(landmarks[0])
    
    def preprocess_landmarks(self, landmarks: np.ndarray) -> np.ndarray:
        """Preprocess landmarks for model input"""
        # Normalize (same as training)
        landmarks = landmarks.reshape(1, -1)
        return landmarks
    
    def predict(self, image: np.ndarray) -> Dict:
        """Predict ISL sign from image"""
        try:
            # Extract landmarks
            landmarks = self.extract_landmarks(image)
            
            # Preprocess
            processed_landmarks = self.preprocess_landmarks(landmarks)
            
            # Predict
            predictions = self.model.predict(processed_landmarks, verbose=0)
            predicted_class_idx = np.argmax(predictions[0])
            confidence = np.max(predictions[0])
            
            # Decode label
            predicted_sign = self.label_encoder.inverse_transform([predicted_class_idx])[0]
            
            return {
                'sign': predicted_sign,
                'confidence': float(confidence),
                'landmarks': landmarks.tolist(),
                'all_predictions': {
                    self.label_encoder.inverse_transform([i])[0]: float(prob) 
                    for i, prob in enumerate(predictions[0])
                }
            }
            
        except Exception as e:
            return {
                'sign': 'unknown',
                'confidence': 0.0,
                'landmarks': [],
                'error': str(e)
            }
    
    def draw_landmarks(self, image: np.ndarray, landmarks: List) -> np.ndarray:
        """Draw landmarks on image"""
        if landmarks:
            # Convert landmarks back to MediaPipe format
            mp_landmarks = []
            for i in range(0, len(landmarks), 3):
                if i + 2 < len(landmarks):
                    mp_landmarks.append(
                        mp.solutions.hands.HandLandmark(
                            x=landmarks[i],
                            y=landmarks[i+1], 
                            z=landmarks[i+2]
                        )
                    )
            
            if mp_landmarks:
                hand_landmarks = mp.solutions.hands.HandLandmark()
                for i, landmark in enumerate(mp_landmarks):
                    hand_landmarks.landmark[i] = landmark
                
                self.mp_drawing.draw_landmarks(
                    image, hand_landmarks, self.mp_hands.HAND_CONNECTIONS
                )
        
        return image
    
    def cleanup(self):
        """Cleanup resources"""
        self.hands.close()

# Example usage
if __name__ == "__main__":
    detector = ISLDetector()
    
    # Test with webcam
    cap = cv2.VideoCapture(0)
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Flip horizontally for mirror effect
        frame = cv2.flip(frame, 1)
        
        # Predict
        result = detector.predict(frame)
        
        # Draw landmarks
        frame = detector.draw_landmarks(frame, result['landmarks'])
        
        # Display result
        text = f"Sign: {result['sign']} ({result['confidence']:.2f})"
        cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                   1, (0, 255, 0), 2)
        
        cv2.imshow('ISL Detection', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    detector.cleanup()
