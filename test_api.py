import requests
import json

# Test the API endpoints
base_url = "http://localhost:8000"

# Test model loading
print("🔍 Testing model loading...")
response = requests.post(f"{base_url}/api/isl-model/load", 
                        json={"action": "load_model"})
print(f"Model load response: {response.json()}")

# Test label encoder loading
print("\n🔍 Testing label encoder loading...")
response = requests.post(f"{base_url}/api/isl-model/load", 
                        json={"action": "load_encoder"})
print(f"Encoder load response: {response.json()}")

# Test prediction with 126 landmarks
print("\n🔍 Testing prediction...")
test_landmarks = [0.1] * 126  # Create 126 test values
response = requests.post(f"{base_url}/api/isl-model/predict", 
                        json={"landmarks": test_landmarks})
print(f"Prediction response: {response.json()}")
