import whisper
import tempfile
import os
from typing import Optional

class WhisperService:
    def __init__(self, model_name: str = "base"):
        """
        Initialize Whisper service with specified model
        Models: tiny, base, small, medium, large
        base is good balance of speed and accuracy
        """
        self.model_name = model_name
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the Whisper model"""
        try:
            print(f"🤖 Loading Whisper model: {self.model_name}")
            self.model = whisper.load_model(self.model_name)
            print(f"✅ Whisper {self.model_name} model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading Whisper model: {e}")
            raise e
    
    def transcribe_audio(self, audio_data: bytes, language: str = "en") -> dict:
        """
        Transcribe audio data using Whisper
        
        Args:
            audio_data: Raw audio bytes
            language: Language code (default: "en")
        
        Returns:
            Dictionary with transcription results
        """
        if not self.model:
            raise Exception("Whisper model not loaded")
        
        try:
            # Create temporary file with proper extension
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
                temp_file.write(audio_data)
                temp_path = temp_file.name
            
            try:
                print(f"🎤 Transcribing audio with Whisper {self.model_name}...")
                print(f"📁 Temp file: {temp_path}")
                print(f"📊 Audio size: {len(audio_data)} bytes")
                
                # Try to transcribe with Whisper
                result = self.model.transcribe(
                    temp_path, 
                    language=language,
                    fp16=False,
                    verbose=False  # Reduce verbosity
                )
                
                transcript = result.get("text", "").strip()
                confidence = self._calculate_confidence(result)
                
                print(f"✅ Transcription result: '{transcript}'")
                print(f"📊 Confidence: {confidence:.2f}")
                
                return {
                    "success": True,
                    "transcript": transcript,
                    "confidence": confidence,
                    "language": language,
                    "model": self.model_name,
                    "duration": result.get("segments", [{}])[0].get("end", 0) if result.get("segments") else 0
                }
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            print(f"❌ Error transcribing audio: {e}")
            print(f"🔍 Error details: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "transcript": "",
                "confidence": 0.0
            }
    
    def _calculate_confidence(self, result: dict) -> float:
        """Calculate confidence score from Whisper result"""
        try:
            segments = result.get("segments", [])
            if not segments:
                return 0.8  # Default confidence
            
            # Average confidence from all segments
            total_confidence = 0
            segment_count = 0
            
            for segment in segments:
                # Whisper doesn't provide direct confidence, so we use a heuristic
                # based on segment length and no_speech_prob
                no_speech_prob = segment.get("no_speech_prob", 0.5)
                confidence = 1.0 - no_speech_prob
                total_confidence += confidence
                segment_count += 1
            
            return min(total_confidence / segment_count, 1.0) if segment_count > 0 else 0.8
            
        except Exception:
            return 0.8  # Default confidence on error

# Global Whisper service instance
whisper_service = None

def get_whisper_service(model_name: str = "base") -> WhisperService:
    """Get or create Whisper service instance"""
    global whisper_service
    if whisper_service is None:
        whisper_service = WhisperService(model_name)
    return whisper_service

def transcribe_audio_file(audio_path: str, language: str = "en") -> dict:
    """
    Transcribe audio file using Whisper
    
    Args:
        audio_path: Path to audio file
        language: Language code (default: "en")
    
    Returns:
        Dictionary with transcription results
    """
    try:
        with open(audio_path, "rb") as f:
            audio_data = f.read()
        
        service = get_whisper_service()
        return service.transcribe_audio(audio_data, language)
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "transcript": "",
            "confidence": 0.0
        }
