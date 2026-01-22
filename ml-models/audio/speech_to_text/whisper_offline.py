import whisper
import torch
import numpy as np
import logging
from typing import Dict, List, Optional
import threading
import queue
import time
import warnings

# Suppress warnings
warnings.filterwarnings("ignore", category=UserWarning)

class WhisperOfflineSTT:
    def __init__(self, model_size="base", device="auto"):
        """Initialize Whisper offline speech-to-text"""
        self.model_size = model_size
        self.device = self._get_device(device)
        
        # Load model
        self.model = whisper.load_model(model_size, device=self.device)
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Audio settings
        self.sample_rate = 16000  # Whisper requires 16kHz
        self.chunk_duration = 30  # Maximum chunk duration in seconds
        
        # Streaming settings
        self.is_streaming = False
        self.stream_queue = queue.Queue()
        self.stream_thread = None
        self.audio_buffer = []
        
        self.logger.info(f"Whisper model loaded: {model_size} on {self.device}")
    
    def _get_device(self, device):
        """Determine the best device for inference"""
        if device == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        return device
    
    def transcribe_file(self, audio_file_path: str, 
                       language=None, task="transcribe") -> Dict:
        """Transcribe audio file using Whisper"""
        try:
            # Load audio
            audio = whisper.load_audio(audio_file_path)
            
            # Transcribe
            result = self.model.transcribe(
                audio,
                language=language,
                task=task,
                fp16=self.device == "cuda"
            )
            
            # Process result
            segments = []
            for segment in result['segments']:
                segments.append({
                    'start': segment['start'],
                    'end': segment['end'],
                    'text': segment['text'].strip(),
                    'confidence': segment.get('avg_logprob', 0.0)
                })
            
            return {
                'text': result['text'].strip(),
                'language': result['language'],
                'segments': segments,
                'duration': result.get('duration', 0),
                'model': self.model_size,
                'device': self.device
            }
            
        except Exception as e:
            self.logger.error(f"Error transcribing file: {str(e)}")
            return {
                'text': '',
                'error': str(e)
            }
    
    def transcribe_audio_data(self, audio_data: np.ndarray,
                            language=None, task="transcribe") -> Dict:
        """Transcribe audio data using Whisper"""
        try:
            # Ensure correct sample rate
            if len(audio_data.shape) > 1:
                audio_data = np.mean(audio_data, axis=1)
            
            # Resample if needed (assuming input is 44.1kHz)
            if len(audio_data) != self.sample_rate * len(audio_data) // 44100:
                import librosa
                audio_data = librosa.resample(
                    audio_data, 
                    orig_sr=44100, 
                    target_sr=self.sample_rate
                )
            
            # Transcribe
            result = self.model.transcribe(
                audio_data,
                language=language,
                task=task,
                fp16=self.device == "cuda"
            )
            
            # Process result
            segments = []
            for segment in result['segments']:
                segments.append({
                    'start': segment['start'],
                    'end': segment['end'],
                    'text': segment['text'].strip(),
                    'confidence': segment.get('avg_logprob', 0.0)
                })
            
            return {
                'text': result['text'].strip(),
                'language': result['language'],
                'segments': segments,
                'duration': result.get('duration', 0),
                'model': self.model_size,
                'device': self.device
            }
            
        except Exception as e:
            self.logger.error(f"Error transcribing audio data: {str(e)}")
            return {
                'text': '',
                'error': str(e)
            }
    
    def start_streaming(self, callback=None, language=None):
        """Start streaming transcription"""
        try:
            if self.is_streaming:
                return {'status': 'already_streaming'}
            
            self.is_streaming = True
            self.audio_buffer = []
            self.stream_thread = threading.Thread(
                target=self._stream_worker,
                args=(callback, language)
            )
            self.stream_thread.daemon = True
            self.stream_thread.start()
            
            return {'status': 'streaming_started'}
            
        except Exception as e:
            self.logger.error(f"Error starting stream: {str(e)}")
            return {'error': str(e)}
    
    def add_audio_chunk(self, audio_chunk: np.ndarray):
        """Add audio chunk to buffer for streaming"""
        try:
            if self.is_streaming:
                self.audio_buffer.append(audio_chunk)
        except Exception as e:
            self.logger.error(f"Error adding audio chunk: {str(e)}")
    
    def _stream_worker(self, callback, language):
        """Worker thread for streaming transcription"""
        try:
            while self.is_streaming:
                if len(self.audio_buffer) > 0:
                    # Combine buffered audio
                    combined_audio = np.concatenate(self.audio_buffer)
                    self.audio_buffer = []
                    
                    # Transcribe chunk
                    result = self.transcribe_audio_data(combined_audio, language)
                    
                    # Send result
                    if callback:
                        callback(result)
                    else:
                        self.stream_queue.put(result)
                
                time.sleep(0.1)  # Small delay to prevent excessive CPU usage
                
        except Exception as e:
            self.logger.error(f"Stream worker error: {str(e)}")
    
    def stop_streaming(self):
        """Stop streaming transcription"""
        try:
            self.is_streaming = False
            
            if self.stream_thread and self.stream_thread.is_alive():
                self.stream_thread.join(timeout=2)
            
            # Process remaining audio
            if len(self.audio_buffer) > 0:
                combined_audio = np.concatenate(self.audio_buffer)
                result = self.transcribe_audio_data(combined_audio)
                self.stream_queue.put(result)
            
            return {'status': 'streaming_stopped'}
            
        except Exception as e:
            self.logger.error(f"Error stopping stream: {str(e)}")
            return {'error': str(e)}
    
    def get_stream_result(self, timeout=1.0) -> Optional[Dict]:
        """Get result from streaming queue"""
        try:
            return self.stream_queue.get(timeout=timeout)
        except queue.Empty:
            return None
    
    def get_supported_languages(self) -> List[str]:
        """Get supported languages"""
        # Whisper supports these languages
        return [
            "af", "ar", "hy", "az", "be", "bs", "bg", "ca", "zh", "hr",
            "cs", "da", "nl", "en", "et", "fi", "fr", "gl", "de", "el",
            "he", "hi", "hu", "is", "id", "it", "ja", "kn", "kk", "ko",
            "lv", "lt", "mk", "ms", "mr", "mi", "ne", "no", "fa", "pl",
            "pt", "ro", "ru", "sr", "sk", "sl", "es", "sw", "sv", "tl",
            "ta", "th", "tr", "uk", "ur", "vi", "cy"
        ]
    
    def detect_language(self, audio_file_path: str) -> Dict:
        """Detect language from audio file"""
        try:
            # Load audio
            audio = whisper.load_audio(audio_file_path)
            
            # Detect language
            audio = whisper.pad_or_trim(audio)
            mel = whisper.log_mel_spectrogram(audio).to(self.device)
            
            _, probs = self.model.detect_language(mel)
            
            # Get top 5 languages
            top_languages = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:5]
            
            return {
                'detected_language': max(probs, key=probs.get),
                'confidence': float(probs[max(probs, key=probs.get)]),
                'all_probabilities': {k: float(v) for k, v in top_languages}
            }
            
        except Exception as e:
            self.logger.error(f"Error detecting language: {str(e)}")
            return {'error': str(e)}
    
    def translate_audio(self, audio_file_path: str, target_language="en") -> Dict:
        """Translate audio to target language"""
        try:
            # Transcribe with translation task
            result = self.transcribe_file(
                audio_file_path, 
                task="translate"
            )
            
            return {
                'translated_text': result['text'],
                'original_language': result.get('language', 'unknown'),
                'target_language': target_language,
                'segments': result.get('segments', [])
            }
            
        except Exception as e:
            self.logger.error(f"Error translating audio: {str(e)}")
            return {'error': str(e)}
    
    def get_model_info(self) -> Dict:
        """Get model information"""
        return {
            'model_size': self.model_size,
            'device': self.device,
            'sample_rate': self.sample_rate,
            'supported_languages': self.get_supported_languages(),
            'is_multilingual': self.model_size in ['base', 'small', 'medium', 'large']
        }
    
    def cleanup(self):
        """Cleanup resources"""
        try:
            self.stop_streaming()
            self.audio_buffer = []
            
            # Clear CUDA cache if using GPU
            if self.device == "cuda":
                torch.cuda.empty_cache()
            
            self.logger.info("Whisper STT cleaned up")
            
        except Exception as e:
            self.logger.error(f"Cleanup error: {str(e)}")

# Example usage
if __name__ == "__main__":
    stt = WhisperOfflineSTT(model_size="base")
    
    # Test with file
    print("Testing Whisper transcription...")
    result = stt.transcribe_file("test_audio.wav")
    
    if result['text']:
        print(f"Transcribed: {result['text']}")
        print(f"Language: {result['language']}")
        print(f"Duration: {result['duration']:.2f}s")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")
    
    stt.cleanup()
