#!/usr/bin/env python3

import requests
import base64

# Test the Whisper API with a simple request
def test_whisper_api():
    url = "http://localhost:8000/speech-to-text-base64"
    
    # Create a minimal valid base64 audio data (this will fail but test the API)
    test_data = {
        "audio_data": "data:audio/webm;base64,GkXfow==",
        "language": "en", 
        "model": "base"
    }
    
    try:
        response = requests.post(url, json=test_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ API is working correctly!")
        else:
            print("❌ API returned error")
            
    except Exception as e:
        print(f"❌ Error connecting to API: {e}")

if __name__ == "__main__":
    test_whisper_api()
