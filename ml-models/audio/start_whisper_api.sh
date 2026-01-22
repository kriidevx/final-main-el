#!/bin/bash

# Whisper Speech-to-Text API Startup Script
echo "🚀 Starting Whisper Speech-to-Text API..."

# Check if we're in the correct directory
if [ ! -f "whisper_api.py" ]; then
    echo "❌ Error: whisper_api.py not found. Please run this script from the ml-models/audio directory."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if FFmpeg is available
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  Warning: FFmpeg not found. Please install FFmpeg for better audio support:"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu: sudo apt-get install ffmpeg"
    echo "   Windows: Download from https://ffmpeg.org/download.html"
fi

# Start the API server
echo "🤖 Starting Whisper API server on http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python whisper_api.py
