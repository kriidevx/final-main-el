from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import sys
import tensorflow as tf
import pickle
import numpy as np
import cv2
import mediapipe as mp
from typing import Dict, List, Optional
import json

# Add the ISL directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
model = None
label_encoder = None
CLASSES = []

@app.post("/api/isl-model/load")
async def load_model_or_encoder(action: dict):
    """Load ISL model or label encoder"""
    global model, label_encoder, CLASSES
    
    try:
        if action.get("action") == "load_model":
            # Load the ISL model
            model_path = os.path.join(os.path.dirname(__file__), "isl_mlp_model.h5")
            model = tf.keras.models.load_model(model_path)
            
            # Get model input/output shapes
            input_shape = model.input_shape
            output_shape = model.output_shape
            
            print(f"✅ ISL Model loaded: {model_path}")
            print(f"Input shape: {input_shape}")
            print(f"Output shape: {output_shape}")
            
            return JSONResponse(content={
                "success": True,
                "input_shape": list(input_shape) if input_shape else [1, 126],
                "output_shape": list(output_shape) if output_shape else [1, len(CLASSES) if CLASSES else 1],
                "classes": CLASSES
            })
            
        elif action.get("action") == "load_encoder":
            # Load the label encoder
            encoder_path = os.path.join(os.path.dirname(__file__), "label_encoder (1).pkl")
            with open(encoder_path, "rb") as f:
                label_encoder = pickle.load(f)
                CLASSES = label_encoder.classes_.tolist() if hasattr(label_encoder, 'classes_') else []
                
            print(f"✅ Label encoder loaded: {encoder_path}")
            print(f"Classes: {CLASSES}")
            
            return JSONResponse(content={
                "success": True,
                "classes": CLASSES
            })
            
        else:
            return JSONResponse(content={
                "success": False,
                "error": f"Unknown action: {action.get('action')}"
            }, status_code=400)
            
    except Exception as e:
        print(f"❌ Error loading model/encoder: {str(e)}")
        return JSONResponse(content={
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.post("/api/isl-model/predict")
async def predict_isl_sign(data: dict):
    """Predict ISL sign from landmarks"""
    global model, label_encoder, CLASSES
    
    try:
        if model is None or label_encoder is None:
            return JSONResponse(content={
                "success": False,
                "error": "Model or label encoder not loaded"
            }, status_code=400)
        
        landmarks = data.get("landmarks", [])
        if not landmarks or len(landmarks) != 126:
            return JSONResponse(content={
                "success": False,
                "error": "Invalid landmarks data"
            }, status_code=400)
        
        # Convert to numpy array and reshape
        landmarks_array = np.array(landmarks).reshape(1, -1)
        
        # Make prediction
        predictions = model.predict(landmarks_array, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        predicted_class = CLASSES[predicted_class_idx] if predicted_class_idx < len(CLASSES) else "UNKNOWN"
        
        print(f"🔍 Prediction: {predicted_class} (confidence: {confidence:.3f})")
        
        return JSONResponse(content={
            "success": True,
            "prediction": {
                "label": predicted_class,
                "confidence": confidence,
                "all_predictions": {
                    CLASSES[i]: float(predictions[0][i]) for i in range(len(CLASSES))
                }
            }
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        return JSONResponse(content={
            "success": False,
            "error": str(e)
        }, status_code=500)

if __name__ == "__main__":
    print("🚀 Starting ISL Model API Server...")
    print("📁 Available endpoints:")
    print("  POST /api/isl-model/load - Load model/label encoder")
    print("  POST /api/isl-model/predict - Predict ISL sign")
    print("🔗 Frontend should connect to: http://localhost:8000/api/isl-model/load")
    
    uvicorn.run(
        "api_bridge:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
