import os
import requests
import time

# Murf AI API configuration
MURF_AI_API_KEY = os.getenv('MURF_AI_API_KEY', 'ap2_17f8d954-f3d2-473b-8e0f-690e93863e0b')
MURF_AI_API_URL = "https://api.murf.ai"

class TTSClient:
    def __init__(self, api_key=None):
        self.api_key = api_key or MURF_AI_API_KEY
        self.headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json"
        }

    def get_voices(self):
        """Get available voices from Murf AI - returning default voices since API endpoint is not available"""
        # Return default voices since the API endpoint is not working
        return {
            "voices": [
                {
                    "voice_id": "Matthew",
                    "name": "Matthew",
                    "category": "premade",
                    "labels": {
                        "language": "English",
                        "accent": "American",
                        "gender": "Male"
                    }
                },
                {
                    "voice_id": "Amy",
                    "name": "Amy",
                    "category": "premade",
                    "labels": {
                        "language": "English",
                        "accent": "British",
                        "gender": "Female"
                    }
                },
                {
                    "voice_id": "Joanna",
                    "name": "Joanna",
                    "category": "premade",
                    "labels": {
                        "language": "English",
                        "accent": "American",
                        "gender": "Female"
                    }
                }
            ]
        }

    def text_to_speech(self, text, voice_id="Matthew", model="FALCON", multiNativeLocale="en-US"):
        """Convert text to speech using Murf AI Stream Speech API"""
        try:
            # Use the Stream Speech endpoint
            response = requests.post(
                f"{MURF_AI_API_URL}/v1/speech/stream",
                headers=self.headers,
                json={
                    "text": text,
                    "voiceId": voice_id,
                    "model": model,
                    "multiNativeLocale": multiNativeLocale
                }
            )
            
            response.raise_for_status()
            
            # Return the audio content directly
            return response.content
            
        except Exception as e:
            print(f"Error in text-to-speech conversion: {e}")
            raise e

# Example usage
if __name__ == "__main__":
    client = TTSClient()
    
    # Get available voices
    voices_data = client.get_voices()
    voices = voices_data.get("voices", [])
    print("Available voices:", voices)
    
    # Convert text to speech
    try:
        audio_data = client.text_to_speech(
            "Hi, How are you doing today?",
            voice_id="Matthew",
            model="FALCON",
            multiNativeLocale="en-US"
        )
        print(f"Generated audio data of {len(audio_data)} bytes")
        
        # Save to file
        with open("output.mp3", "wb") as f:
            f.write(audio_data)
        print("Audio saved to output.mp3")
        
    except Exception as e:
        print(f"Error: {e}")