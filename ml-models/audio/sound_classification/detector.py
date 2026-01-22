from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import io
import wave
import struct
from yamnet_model import YAMNetSoundClassifier
import logging
import threading
import time
from collections import deque

app = Flask(__name__)
CORS(app)

# Initialize classifier
classifier = YAMNetSoundClassifier()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for streaming
audio_buffer = deque(maxlen=100)
stream_active = False
stream_thread = None

class AudioStreamer:
    def __init__(self, classifier):
        self.classifier = classifier
        self.is_running = False
        self.callbacks = []
        
    def add_callback(self, callback):
        """Add callback for streaming results"""
        self.callbacks.append(callback)
    
    def remove_callback(self, callback):
        """Remove callback"""
        if callback in self.callbacks:
            self.callbacks.remove(callback)
    
    def process_audio_chunk(self, audio_data):
        """Process audio chunk and notify callbacks"""
        try:
            result = self.classifier.classify_stream(audio_data)
            
            # Notify all callbacks
            for callback in self.callbacks:
                try:
                    callback(result)
                except Exception as e:
                    logger.error(f"Callback error: {str(e)}")
                    
        except Exception as e:
            logger.error(f"Processing error: {str(e)}")

# Global streamer
streamer = AudioStreamer(classifier)

def decode_base64_audio(base64_audio):
    """Decode base64 audio to numpy array"""
    try:
        # Decode base64
        audio_bytes = base64.b64decode(base64_audio)
        
        # Create wave file from bytes
        audio_io = io.BytesIO(audio_bytes)
        
        # Read wave file
        with wave.open(audio_io, 'rb') as wav_file:
            # Get audio parameters
            n_channels = wav_file.getnchannels()
            sample_width = wav_file.getsampwidth()
            frame_rate = wav_file.getframerate()
            n_frames = wav_file.getnframes()
            
            # Read audio data
            audio_data = wav_file.readframes(n_frames)
            
            # Convert to numpy array
            if sample_width == 1:
                dtype = np.uint8
                audio_array = np.frombuffer(audio_data, dtype=dtype)
                audio_array = (audio_array.astype(np.float32) - 128) / 128.0
            elif sample_width == 2:
                dtype = np.int16
                audio_array = np.frombuffer(audio_data, dtype=dtype)
                audio_array = audio_array.astype(np.float32) / 32768.0
            else:
                raise ValueError(f"Unsupported sample width: {sample_width}")
            
            # Convert to mono if needed
            if n_channels > 1:
                audio_array = audio_array.reshape(-1, n_channels)
                audio_array = np.mean(audio_array, axis=1)
            
            # Resample if needed
            if frame_rate != classifier.sample_rate:
                import librosa
                audio_array = librosa.resample(
                    audio_array, 
                    orig_sr=frame_rate, 
                    target_sr=classifier.sample_rate
                )
            
            return audio_array
            
    except Exception as e:
        logger.error(f"Audio decoding error: {str(e)}")
        return np.array([])

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'model': 'yamnet_sound_classifier',
        'sample_rate': classifier.sample_rate
    })

@app.route('/classify', methods=['POST'])
def classify_audio():
    """Classify audio from base64 data"""
    try:
        data = request.get_json()
        
        if not data or 'audio' not in data:
            return jsonify({'error': 'No audio data provided'}), 400
        
        # Decode audio
        audio_array = decode_base64_audio(data['audio'])
        
        if len(audio_array) == 0:
            return jsonify({'error': 'Failed to decode audio'}), 400
        
        # Classify
        result = classifier.classify_sound(audio_array)
        
        # Add alert information
        if result['top_class'] != 'unknown':
            result['alert_level'] = classifier.get_alert_level(
                result['category'], result['confidence']
            )
            result['alert_message'] = classifier.generate_alert_message(result)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/classify_file', methods=['POST'])
def classify_audio_file():
    """Classify audio from uploaded file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file temporarily
        temp_path = 'temp_audio.wav'
        file.save(temp_path)
        
        # Load and classify
        audio_array = classifier.load_audio(temp_path)
        
        if len(audio_array) == 0:
            return jsonify({'error': 'Failed to load audio file'}), 400
        
        result = classifier.classify_sound(audio_array)
        
        # Add alert information
        if result['top_class'] != 'unknown':
            result['alert_level'] = classifier.get_alert_level(
                result['category'], result['confidence']
            )
            result['alert_message'] = classifier.generate_alert_message(result)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"File classification error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/stream_start', methods=['POST'])
def start_stream():
    """Start audio streaming"""
    try:
        global stream_active
        
        if stream_active:
            return jsonify({'status': 'already_streaming'})
        
        stream_active = True
        
        return jsonify({
            'status': 'streaming_started',
            'sample_rate': classifier.sample_rate,
            'message': 'Send audio chunks to /stream_audio'
        })
        
    except Exception as e:
        logger.error(f"Stream start error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/stream_audio', methods=['POST'])
def stream_audio():
    """Process streaming audio chunk"""
    try:
        if not stream_active:
            return jsonify({'error': 'Stream not active'}), 400
        
        data = request.get_json()
        
        if not data or 'audio_chunk' not in data:
            return jsonify({'error': 'No audio chunk provided'}), 400
        
        # Decode audio
        audio_array = decode_base64_audio(data['audio_chunk'])
        
        if len(audio_array) == 0:
            return jsonify({'error': 'Failed to decode audio chunk'}), 400
        
        # Process through streamer
        streamer.process_audio_chunk(audio_array)
        
        return jsonify({'status': 'chunk_processed'})
        
    except Exception as e:
        logger.error(f"Stream audio error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/stream_stop', methods=['POST'])
def stop_stream():
    """Stop audio streaming"""
    try:
        global stream_active
        
        stream_active = False
        
        return jsonify({'status': 'streaming_stopped'})
        
    except Exception as e:
        logger.error(f"Stream stop error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/categories', methods=['GET'])
def get_categories():
    """Get supported sound categories"""
    try:
        categories = classifier.get_supported_categories()
        return jsonify({'categories': categories})
    except Exception as e:
        logger.error(f"Categories error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/category_classes/<category>', methods=['GET'])
def get_category_classes(category):
    """Get classes for a specific category"""
    try:
        classes = classifier.get_category_classes(category)
        return jsonify({'category': category, 'classes': classes})
    except Exception as e:
        logger.error(f"Category classes error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/alert_config', methods=['GET', 'POST'])
def alert_config():
    """Get or update alert configuration"""
    if request.method == 'GET':
        return jsonify({
            'alert_levels': ['critical', 'high', 'medium', 'low', 'none'],
            'categories': classifier.get_supported_categories()
        })
    else:
        # Update configuration (placeholder)
        return jsonify({'status': 'config_updated'})

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5003, debug=True)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        stream_active = False
