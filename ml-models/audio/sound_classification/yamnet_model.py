import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
import librosa
import json
from typing import Dict, List, Tuple
import logging

class YAMNetSoundClassifier:
    def __init__(self, model_url="https://tfhub.dev/google/yamnet/1", 
                 class_mapping_file='sound_categories.json'):
        """Initialize YAMNet sound classifier"""
        self.model = hub.load(model_url)
        self.class_mapping = self.load_class_mapping(class_mapping_file)
        
        # YAMNet sample rate
        self.sample_rate = 16000
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def load_class_mapping(self, class_mapping_file):
        """Load sound category mapping"""
        try:
            with open(class_mapping_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Default mapping for important sounds
            return {
                "emergency": [
                    "Siren", "Alarm", "Fire alarm", "Smoke detector", 
                    "Emergency vehicle", "Police car", "Ambulance"
                ],
                "vehicle": [
                    "Car", "Bus", "Motorcycle", "Truck", "Train", 
                    "Airplane", "Helicopter", "Bicycle"
                ],
                "nature": [
                    "Bird", "Dog", "Cat", "Rain", "Thunder", "Wind",
                    "Insect", "Crickets", "Water", "Ocean"
                ],
                "human": [
                    "Speech", "Crying baby", "Laughter", "Cough", 
                    "Sneeze", "Footsteps", "Clapping", "Cheering"
                ],
                "household": [
                    "Doorbell", "Telephone", "Knock", "Dishwasher", 
                    "Vacuum cleaner", "Washing machine", "Microwave"
                ],
                "danger": [
                    "Glass shattering", "Explosion", "Gunshot", 
                    "Screaming", "Fire", "Smoke alarm"
                ]
            }
    
    def load_audio(self, audio_file: str) -> np.ndarray:
        """Load and preprocess audio file"""
        try:
            # Load audio file
            waveform, sample_rate = librosa.load(audio_file, sr=self.sample_rate)
            
            # Ensure mono
            if len(waveform.shape) > 1:
                waveform = librosa.to_mono(waveform)
            
            return waveform
            
        except Exception as e:
            self.logger.error(f"Error loading audio file: {str(e)}")
            return np.array([])
    
    def preprocess_audio(self, waveform: np.ndarray) -> np.ndarray:
        """Preprocess audio for YAMNet"""
        # Normalize waveform
        if len(waveform) > 0:
            waveform = waveform / np.max(np.abs(waveform))
        
        return waveform
    
    def classify_sound(self, waveform: np.ndarray) -> Dict:
        """Classify sound using YAMNet"""
        try:
            # Ensure waveform is not empty
            if len(waveform) == 0:
                return {
                    'predictions': [],
                    'top_class': 'unknown',
                    'confidence': 0.0,
                    'category': 'unknown',
                    'error': 'Empty audio waveform'
                }
            
            # Run inference
            scores, embeddings, spectrogram = self.model(waveform)
            
            # Get class scores (average across time steps)
            class_scores = np.mean(scores, axis=0)
            
            # Get top predictions
            top_indices = np.argsort(class_scores)[::-1][:10]
            
            predictions = []
            for idx in top_indices:
                class_name = self.model.class_names[idx]
                confidence = float(class_scores[idx])
                
                # Map to category
                category = self.map_to_category(class_name)
                
                predictions.append({
                    'class': class_name,
                    'confidence': confidence,
                    'category': category,
                    'index': int(idx)
                })
            
            # Get top prediction
            top_prediction = predictions[0] if predictions else None
            
            return {
                'predictions': predictions,
                'top_class': top_prediction['class'] if top_prediction else 'unknown',
                'confidence': top_prediction['confidence'] if top_prediction else 0.0,
                'category': top_prediction['category'] if top_prediction else 'unknown',
                'embeddings': embeddings.numpy().tolist(),
                'spectrogram': spectrogram.numpy().tolist()
            }
            
        except Exception as e:
            self.logger.error(f"Error classifying sound: {str(e)}")
            return {
                'predictions': [],
                'top_class': 'unknown',
                'confidence': 0.0,
                'category': 'unknown',
                'error': str(e)
            }
    
    def map_to_category(self, class_name: str) -> str:
        """Map YAMNet class to broader category"""
        for category, classes in self.class_mapping.items():
            if class_name in classes:
                return category
        
        return 'other'
    
    def get_alert_level(self, category: str, confidence: float) -> str:
        """Determine alert level based on category and confidence"""
        if category == "danger" and confidence > 0.5:
            return "critical"
        elif category == "emergency" and confidence > 0.6:
            return "high"
        elif category == "vehicle" and confidence > 0.7:
            return "medium"
        elif category == "human" and confidence > 0.6:
            return "medium"
        else:
            return "low"
    
    def generate_alert_message(self, classification: Dict) -> str:
        """Generate alert message for deaf users"""
        top_class = classification['top_class']
        category = classification['category']
        confidence = classification['confidence']
        alert_level = self.get_alert_level(category, confidence)
        
        if alert_level == "critical":
            return f"⚠️ DANGER: {top_class} detected!"
        elif alert_level == "high":
            return f"🚨 ALERT: {top_class} nearby"
        elif alert_level == "medium":
            return f"🔊 {top_class} detected"
        elif confidence > 0.5:
            return f"👂 {top_class} sound"
        else:
            return ""
    
    def classify_stream(self, audio_chunk: np.ndarray) -> Dict:
        """Classify audio chunk for streaming"""
        try:
            # Preprocess audio
            processed_audio = self.preprocess_audio(audio_chunk)
            
            # Classify
            result = self.classify_sound(processed_audio)
            
            # Add alert information
            if result['top_class'] != 'unknown':
                result['alert_level'] = self.get_alert_level(
                    result['category'], result['confidence']
                )
                result['alert_message'] = self.generate_alert_message(result)
            else:
                result['alert_level'] = 'none'
                result['alert_message'] = ''
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error in stream classification: {str(e)}")
            return {
                'error': str(e),
                'alert_level': 'none',
                'alert_message': ''
            }
    
    def get_supported_categories(self) -> List[str]:
        """Get list of supported categories"""
        return list(self.class_mapping.keys())
    
    def get_category_classes(self, category: str) -> List[str]:
        """Get classes for a specific category"""
        return self.class_mapping.get(category, [])

# Example usage
if __name__ == "__main__":
    classifier = YAMNetSoundClassifier()
    
    # Test with audio file
    audio_file = "test_audio.wav"
    
    try:
        # Load and classify
        waveform = classifier.load_audio(audio_file)
        if len(waveform) > 0:
            result = classifier.classify_sound(waveform)
            
            print(f"Top prediction: {result['top_class']} ({result['confidence']:.2f})")
            print(f"Category: {result['category']}")
            print(f"Alert message: {classifier.generate_alert_message(result)}")
            
            # Show top 5 predictions
            print("\nTop 5 predictions:")
            for pred in result['predictions'][:5]:
                print(f"  {pred['class']}: {pred['confidence']:.2f} ({pred['category']})")
        else:
            print("Failed to load audio file")
            
    except Exception as e:
        print(f"Error: {str(e)}")
