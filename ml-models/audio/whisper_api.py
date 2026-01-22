from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import sys
from pathlib import Path
from pydantic import BaseModel

# Add current directory to Python path
sys.path.append(str(Path(__file__).parent))

from whisper_service import get_whisper_service

# Pydantic model for base64 audio request
class AudioRequest(BaseModel):
    audio_data: str
    language: str = "en"
    model: str = "base"

app = FastAPI(title="Whisper Speech-to-Text API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Whisper Speech-to-Text API",
        "status": "Running",
        "models": ["tiny", "base", "small", "medium", "large"],
        "current_model": "base"
    }

@app.post("/speech-to-text")
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = "en",
    model: str = "base"
):
    """
    Transcribe audio file using OpenAI Whisper
    
    Args:
        file: Audio file (WAV, MP3, M4A, WebM, etc.)
        language: Language code (default: "en")
        model: Whisper model size (default: "base")
    
    Returns:
        Transcription result with text and confidence
    """
    try:
        print(f"🎤 Received audio file: {file.filename}")
        print(f"📝 Language: {language}, Model: {model}")
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Please upload an audio file."
            )
        
        # Read audio data
        audio_data = await file.read()
        
        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="Empty audio file received."
            )
        
        print(f"📦 Audio data size: {len(audio_data)} bytes")
        
        # Get Whisper service and transcribe
        whisper_service = get_whisper_service(model)
        result = whisper_service.transcribe_audio(audio_data, language)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Transcription failed: {result.get('error', 'Unknown error')}"
            )
        
        print(f"✅ Transcription completed: {result['transcript'][:50]}...")
        
        return {
            "success": True,
            "transcript": result["transcript"],
            "confidence": result["confidence"],
            "language": result["language"],
            "model": result["model"],
            "duration": result["duration"],
            "timestamp": "2024-01-01T00:00:00Z"  # Placeholder timestamp
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/speech-to-text-base64")
async def speech_to_text_base64(request: AudioRequest):
    """
    Transcribe base64 encoded audio using OpenAI Whisper
    
    Args:
        request: AudioRequest with base64 audio data, language, and model
    
    Returns:
        Transcription result with text and confidence
    """
    try:
        import base64
        
        audio_data = request.audio_data
        language = request.language
        model = request.model
        
        print(f"🎤 Received base64 audio data")
        print(f"📝 Language: {language}, Model: {model}")
        
        # Decode base64 audio
        # Remove data URL prefix if present
        if "," in audio_data:
            audio_data = audio_data.split(",", 1)[1]
        
        audio_bytes = base64.b64decode(audio_data)
        
        if not audio_bytes:
            raise HTTPException(
                status_code=400,
                detail="Invalid base64 audio data."
            )
        
        print(f"📦 Audio data size: {len(audio_bytes)} bytes")
        
        # Get Whisper service and transcribe
        whisper_service = get_whisper_service(model)
        result = whisper_service.transcribe_audio(audio_bytes, language)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Transcription failed: {result.get('error', 'Unknown error')}"
            )
        
        print(f"✅ Transcription completed: {result['transcript'][:50]}...")
        
        return {
            "success": True,
            "transcript": result["transcript"],
            "confidence": result["confidence"],
            "language": result["language"],
            "model": result["model"],
            "duration": result["duration"],
            "timestamp": "2024-01-01T00:00:00Z"  # Placeholder timestamp
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test if Whisper service is available
        service = get_whisper_service()
        return {
            "status": "healthy",
            "whisper_loaded": service.model is not None,
            "model": service.model_name
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
