import * as tf from '@tensorflow/tfjs';

// Interface for model prediction
interface ModelPrediction {
  label: string;
  confidence: number;
  all_predictions?: Record<string, number>;
}

// Mock model interface for compatibility
interface MockModel {
  inputs: Array<{ shape: number[] }>;
  outputs: Array<{ shape: number[] }>;
  predict: (input: any) => Promise<ModelPrediction | any>;
}

// Load the real ISL MLP model via Python backend
export async function loadISLModel(): Promise<MockModel> {
  try {
    console.log('🔍 Loading ISL model via Python backend...');
    
    // Call Python backend for model loading
    const response = await fetch('http://localhost:8000/api/isl-model/load', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'load_model'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ ISL model loaded successfully via Python backend');
      console.log('Model classes:', result.classes);
      console.log('Model input shape:', result.input_shape);
      console.log('Model output shape:', result.output_shape);
      
      // Return a mock model object for compatibility
      return {
        inputs: [{ shape: result.input_shape }],
        outputs: [{ shape: result.output_shape }],
        predict: async (input: any): Promise<ModelPrediction> => {
          console.log('🎯 Sending prediction request to Python backend...');
          
          // Call Python backend for prediction
          const predictionResponse = await fetch('http://localhost:8000/api/isl-model/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              landmarks: input.landmarks || input,
              action: 'predict'
            })
          });
          
          if (!predictionResponse.ok) {
            throw new Error(`Prediction HTTP error! status: ${predictionResponse.status}`);
          }
          
          const predictionResult = await predictionResponse.json();
          
          if (predictionResult.success) {
            console.log('🎉 Prediction received:', predictionResult.prediction);
            return {
              label: predictionResult.prediction?.label || 'UNKNOWN',
              confidence: predictionResult.prediction?.confidence || 0,
              all_predictions: predictionResult.prediction?.all_predictions || {}
            };
          } else {
            console.error('❌ Prediction failed:', predictionResult.error);
            return {
              label: 'UNKNOWN',
              confidence: 0,
              all_predictions: {}
            };
          }
        }
      } as MockModel;
    } else {
      throw new Error(result.error || 'Failed to load ISL model');
    }
  } catch (error) {
    console.error('❌ Error loading ISL model:', error);
    throw error;
  }
}

// Load the real label encoder via Python backend
export async function loadLabelEncoder() {
  try {
    console.log('🔍 Loading label encoder via Python backend...');
    
    // Call Python backend for label encoder
    const response = await fetch('http://localhost:8000/api/isl-model/load', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'load_encoder'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Label encoder loaded successfully via Python backend');
      console.log('Available classes:', result.classes);
      
      // Create label encoder mapping
      const labelToIndex = new Map<string, number>();
      const indexToLabel = new Map<number, string>();
      
      result.classes.forEach((label: string, index: number) => {
        labelToIndex.set(label, index);
        indexToLabel.set(index, label);
      });
      
      return {
        classes: result.classes,
        labelToIndex,
        indexToLabel
      };
    } else {
      throw new Error(result.error || 'Failed to load label encoder');
    }
  } catch (error) {
    console.error('❌ Error loading label encoder:', error);
    throw error;
  }
}

// Load ISL landmarks data
export async function loadLandmarksData() {
  try {
    const response = await fetch('/ml-models/sign-language/isl/isl_landmarks.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    const landmarks = lines.map(line => {
      const values = line.split(',');
      // First 126 values are landmarks, last value is label
      const landmarkData = values.slice(0, 126).map(v => parseFloat(v));
      const label = values[126]?.trim() || 'unknown';
      return { label, landmarks: landmarkData };
    }).filter(item => item.landmarks.length > 0 && !isNaN(item.landmarks[0]));

    console.log('Landmarks data loaded:', landmarks.length, 'samples');
    return landmarks;
  } catch (error) {
    console.error('Error loading landmarks data:', error);
    throw error;
  }
}

// Predict ISL sign from landmarks
export async function predictISLSign(
  model: tf.LayersModel,
  landmarks: number[],
  labelEncoder: { indexToLabel: Map<number, string> }
) {
  try {
    // Convert landmarks to tensor (126 features)
    const inputTensor = tf.tensor2d([landmarks], [1, 126]);
    
    // Make prediction
    const prediction = await model.predict(inputTensor) as tf.Tensor;
    const probabilities = await prediction.data();
    
    // Get the predicted class
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    const confidence = probabilities[maxIndex];
    const predictedLabel = labelEncoder.indexToLabel.get(maxIndex) || 'unknown';
    
    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();
    
    return {
      label: predictedLabel,
      confidence: confidence,
      allPredictions: Array.from(probabilities).map((prob, idx) => ({
        label: labelEncoder.indexToLabel.get(idx) || 'unknown',
        confidence: prob
      }))
    };
  } catch (error) {
    console.error('Error predicting ISL sign:', error);
    throw error;
  }
}

// ISL model integration complete - no mock data needed
