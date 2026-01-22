import speech_recognition as sr
import json
import logging
from typing import Dict, Optional, List
import threading
import queue
import time

class GoogleSpeechToText:
    def __init__(self, api_key=None):
        """Initialize Google Speech-to-Text"""
        self.recognizer = sr.Recognizer()
        self.microphone = None
        self.api_key = api_key
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Audio settings
        self.energy_threshold = 300
        self.dynamic_energy_threshold = True
        self.pause_threshold = 0.8
        self.phrase_threshold = 0.3
        self.non_speaking_duration = 0.5
        
        # Streaming settings
        self.is_streaming = False
        self.stream_queue = queue.Queue()
        self.stream_thread = None
        
        # Configure recognizer
        self.recognizer.energy_threshold = self.energy_threshold
        self.recognizer.dynamic_energy_threshold = self.dynamic_energy_threshold
        self.recognizer.pause_threshold = self.pause_threshold
        self.recognizer.phrase_threshold = self.phrase_threshold
        self.recognizer.non_speaking_duration = self.non_speaking_duration
    
    def list_microphones(self) -> List[Dict]:
        """List available microphones"""
        try:
            mic_list = []
            for i, mic_name in enumerate(sr.Microphone.list_microphone_names()):
                mic_list.append({
                    'index': i,
                    'name': mic_name,
                    'device_id': i
                })
            return mic_list
        except Exception as e:
            self.logger.error(f"Error listing microphones: {str(e)}")
            return []
    
    def set_microphone(self, device_index=None):
        """Set microphone for recording"""
        try:
            self.microphone = sr.Microphone(device_index=device_index)
            
            # Calibrate microphone
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
            
            self.logger.info(f"Microphone set: {self.microphone}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error setting microphone: {str(e)}")
            return False
    
    def recognize_from_file(self, audio_file_path: str, 
                          language="en-US") -> Dict:
        """Recognize speech from audio file"""
        try:
            with sr.AudioFile(audio_file_path) as source:
                audio = self.recognizer.record(source)
            
            return self._process_audio(audio, language)
            
        except Exception as e:
            self.logger.error(f"Error recognizing from file: {str(e)}")
            return {
                'text': '',
                'confidence': 0.0,
                'error': str(e)
            }
    
    def recognize_from_microphone(self, language="en-US", 
                                timeout=5, phrase_time_limit=30) -> Dict:
        """Recognize speech from microphone"""
        try:
            if not self.microphone:
                self.set_microphone()
            
            with self.microphone as source:
                self.logger.info("Listening...")
                audio = self.recognizer.listen(
                    source, 
                    timeout=timeout, 
                    phrase_time_limit=phrase_time_limit
                )
            
            return self._process_audio(audio, language)
            
        except sr.WaitTimeoutError:
            return {
                'text': '',
                'confidence': 0.0,
                'error': 'Listening timeout - no speech detected'
            }
        except Exception as e:
            self.logger.error(f"Error recognizing from microphone: {str(e)}")
            return {
                'text': '',
                'confidence': 0.0,
                'error': str(e)
            }
    
    def _process_audio(self, audio, language="en-US") -> Dict:
        """Process audio and return transcription"""
        try:
            # Try Google Speech Recognition first
            try:
                text = self.recognizer.recognize_google(
                    audio, 
                    language=language,
                    key=self.api_key
                )
                confidence = 0.95  # Google doesn't provide confidence for free API
                
                return {
                    'text': text,
                    'confidence': confidence,
                    'engine': 'google',
                    'language': language,
                    'alternatives': []
                }
                
            except sr.UnknownValueError:
                return {
                    'text': '',
                    'confidence': 0.0,
                    'error': 'Speech could not be understood'
                }
            except sr.RequestError as e:
                self.logger.warning(f"Google API error: {str(e)}")
                
                # Fallback to Sphinx (offline)
                try:
                    text = self.recognizer.recognize_sphinx(audio, language=language)
                    confidence = 0.7  # Estimated confidence for Sphinx
                    
                    return {
                        'text': text,
                        'confidence': confidence,
                        'engine': 'sphinx',
                        'language': language,
                        'alternatives': []
                    }
                    
                except sr.UnknownValueError:
                    return {
                        'text': '',
                        'confidence': 0.0,
                        'error': 'Speech could not be understood by any engine'
                    }
                
        except Exception as e:
            self.logger.error(f"Error processing audio: {str(e)}")
            return {
                'text': '',
                'confidence': 0.0,
                'error': str(e)
            }
    
    def start_streaming(self, callback=None, language="en-US"):
        """Start streaming speech recognition"""
        try:
            if self.is_streaming:
                return {'status': 'already_streaming'}
            
            if not self.microphone:
                self.set_microphone()
            
            self.is_streaming = True
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
    
    def _stream_worker(self, callback, language):
        """Worker thread for streaming recognition"""
        try:
            with self.microphone as source:
                while self.is_streaming:
                    try:
                        # Listen for audio
                        audio = self.recognizer.listen(
                            source,
                            timeout=1,
                            phrase_time_limit=10
                        )
                        
                        # Process audio
                        result = self._process_audio(audio, language)
                        
                        # Add to queue or callback
                        if callback:
                            callback(result)
                        else:
                            self.stream_queue.put(result)
                            
                    except sr.WaitTimeoutError:
                        # No speech detected, continue listening
                        continue
                    except Exception as e:
                        self.logger.error(f"Stream processing error: {str(e)}")
                        continue
                        
        except Exception as e:
            self.logger.error(f"Stream worker error: {str(e)}")
    
    def stop_streaming(self):
        """Stop streaming speech recognition"""
        try:
            self.is_streaming = False
            
            if self.stream_thread and self.stream_thread.is_alive():
                self.stream_thread.join(timeout=2)
            
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
    
    def adjust_for_ambient_noise(self, duration=1.0):
        """Adjust for ambient noise"""
        try:
            if not self.microphone:
                self.set_microphone()
            
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=duration)
            
            return {'status': 'noise_adjusted'}
            
        except Exception as e:
            self.logger.error(f"Error adjusting for noise: {str(e)}")
            return {'error': str(e)}
    
    def get_supported_languages(self) -> List[str]:
        """Get supported languages"""
        return [
            "en-US", "en-GB", "en-AU", "en-CA", "en-IN",
            "es-ES", "es-MX", "es-AR", "es-CO", "es-PE",
            "fr-FR", "fr-CA", "fr-BE",
            "de-DE", "de-AT", "de-CH",
            "it-IT", "pt-BR", "pt-PT",
            "ru-RU", "ja-JP", "ko-KR", "zh-CN",
            "ar-SA", "hi-IN", "th-TH", "vi-VN"
        ]
    
    def cleanup(self):
        """Cleanup resources"""
        try:
            self.stop_streaming()
            self.logger.info("Speech-to-text cleaned up")
        except Exception as e:
            self.logger.error(f"Cleanup error: {str(e)}")

# Example usage
if __name__ == "__main__":
    stt = GoogleSpeechToText()
    
    # Test with microphone
    print("Testing speech recognition...")
    result = stt.recognize_from_microphone()
    
    if result['text']:
        print(f"Recognized: {result['text']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Engine: {result['engine']}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")
    
    stt.cleanup()
