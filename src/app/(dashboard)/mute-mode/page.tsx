"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawLandmarks, drawConnectors } from "@mediapipe/drawing_utils";

// Interfaces
interface ModelPrediction {
  label: string;
  confidence: number;
  all_predictions?: Record<string, number>;
}

interface MockModel {
  inputs: Array<{ shape: number[] }>;
  outputs: Array<{ shape: number[] }>;
  predict: (input: any) => Promise<ModelPrediction | any>;
}

interface ISLDetection {
  label: string;
  confidence: number;
  timestamp: string;
  landmarks: number[];
}

interface ConversationHistory {
  id: string;
  type: 'sign' | 'text';
  content: string;
  timestamp: string;
  confidence?: number;
}

export default function MuteModePage() {
  // Refs for MediaPipe and Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const handsRef = useRef<Hands | null>(null);

  // State variables
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentDetection, setCurrentDetection] = useState<ISLDetection | null>(null);
  const [currentSentence, setCurrentSentence] = useState('');
  const [accumulatedLetters, setAccumulatedLetters] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(75);
  const [speechRate, setSpeechRate] = useState(1);
  const [fps, setFps] = useState(0);
  const [model, setModel] = useState<MockModel | null>(null);
  const [labelEncoder, setLabelEncoder] = useState<{ indexToLabel: Map<number, string> } | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);

  // Performance tracking
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  const processingRef = useRef(false);
  const lastPredictionTimeRef = useRef(Date.now());
  const stableDetectionsRef = useRef<string[]>([]);
  const detectionStabilityCountRef = useRef(0);

  // Load ISL Model via Python backend
  const loadISLModel = async (): Promise<MockModel> => {
    try {
      console.log('🔍 Loading ISL model via Python backend...');
      
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
  };

  // Load Label Encoder via Python backend
  const loadLabelEncoder = async () => {
    try {
      console.log('🔍 Loading label encoder via Python backend...');
      
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
  };

  // Load ISL Model and Label Encoder
  const loadISLModelData = async () => {
    try {
      console.log('🔍 Loading ISL model and label encoder...');
      
      // Load real ISL model and label encoder via Python backend
      const [loadedModel, loadedLabelEncoder] = await Promise.all([
        loadISLModel(),
        loadLabelEncoder()
      ]);
      
      setModel(loadedModel);
      setLabelEncoder(loadedLabelEncoder);
      setIsModelLoaded(true);
      
      console.log('✅ ISL system loaded successfully via Python backend');
    } catch (error) {
      console.error('Error loading ISL model:', error);
      setIsModelLoaded(false);
    }
  };

  // Extract features from landmarks (exactly like Python version)
  const extractFeatures = (landmarks: any[]): number[] => {
    const features = [];
    for (const landmark of landmarks) {
      features.push(landmark.x, landmark.y, landmark.z);
    }
    
    // Pad to 126 features if needed (42 landmarks * 3 coords = 126)
    const targetLen = 126;
    while (features.length < targetLen) {
      features.push(0.0, 0.0, 0.0); // Pad with zeros
    }
    
    return features.slice(0, targetLen);
  };

  // Text-to-Speech
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window && isAudioEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.volume = volume / 100;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, [isAudioEnabled, volume, speechRate]);

  // Clear Sentence
  const clearSentence = useCallback(() => {
    setCurrentSentence('');
    setAccumulatedLetters([]);
    setCurrentDetection(null);
    speakText('Sentence cleared');
  }, [speakText]);

  // Clear History
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setCurrentDetection(null);
    speakText('History cleared');
  }, [speakText]);

  // Initialize MediaPipe and Camera
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Initialize MediaPipe Hands
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2, // Allow detection of both hands
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    // MediaPipe Results Handler - THIS IS THE CORE ML PIPELINE
    hands.onResults(async (results) => {
      // Update FPS
      frameCountRef.current++;
      const now = Date.now();
      if (now - lastFpsUpdateRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      // Clear canvas and draw video frame (FIXED: No inversion)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1); // Mirror horizontally to fix inversion
      ctx.drawImage(results.image, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Draw hand landmarks and connections (FIXED: Mirror landmarks too)
        const allMirroredLandmarks = [];
        for (const landmarks of results.multiHandLandmarks) {
          // Mirror landmarks to match video
          const mirroredLandmarks = landmarks.map(landmark => ({
            ...landmark,
            x: 1 - landmark.x // Mirror x coordinate
          }));
          
          allMirroredLandmarks.push(mirroredLandmarks);
          
          drawConnectors(ctx, mirroredLandmarks, HAND_CONNECTIONS, {
            color: "#FFFFFF",
            lineWidth: 2,
          });
          drawLandmarks(ctx, mirroredLandmarks, {
            color: "#FF0000",
            radius: 4,
          });
        }

        // 👇 COMBINED HAND PROCESSING FOR TWO-HANDED SIGNS
        if (model && labelEncoder && !processingRef.current) {
          // Only process every 2 seconds (slower detection to prevent repeats)
          if (now - lastPredictionTimeRef.current < 2000) {
            return;
          }

          try {
            processingRef.current = true;
            setIsProcessing(true);

            // COMBINE BOTH HANDS FOR TWO-HANDED SIGNS (MATCH PYTHON EXACTLY)
            let combinedFeatures: number[] = [];
            
            if (allMirroredLandmarks.length === 2) {
              // Two-handed sign: Extract features from both hands exactly like Python
              console.log('🤚 Two-handed sign detected - extracting from both hands');
              
              // Extract features from both hands (matching Python extract_features)
              for (const landmarks of allMirroredLandmarks) {
                for (const lm of landmarks) {
                  combinedFeatures.push(lm.x, lm.y, lm.z);
                }
              }
              
              // Pad to 126 features if needed (matching Python logic)
              const targetLen = 126;
              while (combinedFeatures.length < targetLen) {
                combinedFeatures.push(0.0, 0.0, 0.0); // Pad with zeros
              }
              
              // Trim to exactly 126 features
              combinedFeatures = combinedFeatures.slice(0, targetLen);
              
              console.log(`🎯 Two-handed features extracted: ${combinedFeatures.length} (expected: ${targetLen})`);
            } else if (allMirroredLandmarks.length === 1) {
              // Single-handed sign: Extract from one hand
              combinedFeatures = extractFeatures(allMirroredLandmarks[0]);
              console.log('👋 Single-handed sign detected');
            }
            
            if (combinedFeatures.length > 0) {
              console.log('🎯 Running ML inference on combined features:', combinedFeatures.length);

              // Make prediction (exactly like Python model.predict)
              const prediction = await model.predict({ landmarks: combinedFeatures });
              
              if (prediction && prediction.label && prediction.label !== 'UNKNOWN' && prediction.confidence > 0.75) {
                console.log(`🎉 ISL DETECTED: ${prediction.label} (${(prediction.confidence * 100).toFixed(1)}% confidence)`);
                console.log(`🤚 Hands used: ${allMirroredLandmarks.length}`);
                
                // STABILITY CHECK: Require 3 consecutive same predictions
                stableDetectionsRef.current.push(prediction.label);
                if (stableDetectionsRef.current.length > 3) {
                  stableDetectionsRef.current.shift();
                }
                
                // Check if last 3 predictions are the same
                const lastThree = stableDetectionsRef.current.slice(-3);
                const isStable = lastThree.length === 3 && lastThree.every(pred => pred === lastThree[0]);
                
                if (isStable) {
                  console.log(`✅ Stable detection confirmed: ${prediction.label}`);
                  lastPredictionTimeRef.current = now;
                  
                  // Update detection
                  const detection: ISLDetection = {
                    label: prediction.label,
                    confidence: prediction.confidence,
                    timestamp: new Date().toLocaleTimeString(),
                    landmarks: combinedFeatures
                  };
                  
                  setCurrentDetection(detection);
                  
                  // Update sentence (exactly like Python version)
                  if (prediction.label !== 'SPACE' && prediction.label !== 'DELETE' && prediction.label !== 'NOTHING') {
                    setAccumulatedLetters(prev => [...prev, prediction.label]);
                    setCurrentSentence(prev => prev + prediction.label);
                    
                    // Add to conversation history
                    const historyItem: ConversationHistory = {
                      id: Date.now().toString(),
                      type: 'sign',
                      content: prediction.label,
                      timestamp: new Date().toLocaleTimeString(),
                      confidence: prediction.confidence
                    };
                    
                    setConversationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
                    
                    // Speak detected sign ONLY if auto-speak is enabled
                    if (autoSpeak) {
                      speakText(prediction.label);
                    }
                  } else if (prediction.label === 'SPACE') {
                    setCurrentSentence(prev => prev + ' ');
                  } else if (prediction.label === 'DELETE') {
                    setCurrentSentence(prev => prev.slice(0, -1));
                  }
                  
                  // Clear stability tracking after successful detection
                  stableDetectionsRef.current = [];
                }
                
                // Draw Prediction Text (exactly like Python cv2.putText)
                ctx.font = "24px Arial";
                ctx.fillStyle = "lime";
                ctx.fillText(`Sign: ${prediction.label}`, 20, 40);
                ctx.fillText(`Conf: ${(prediction.confidence * 100).toFixed(0)}%`, 20, 70);
                ctx.fillText(`Stability: ${stableDetectionsRef.current.length}/3`, 20, 100);
                ctx.fillText(`Hands: ${allMirroredLandmarks.length} (${allMirroredLandmarks.length === 2 ? 'Two-handed' : 'Single-handed'})`, 20, 130);
                
                // Draw sentence at bottom (exactly like Python version)
                if (currentSentence) {
                  ctx.font = "20px Arial";
                  ctx.fillStyle = "cyan";
                  ctx.fillText(`Sentence: ${currentSentence}`, 20, canvas.height - 30);
                }
              } else {
                // Draw low confidence warning
                ctx.font = "20px Arial";
                ctx.fillStyle = "yellow";
                ctx.fillText("Low confidence - hold sign steady", 20, 40);
                // Reset stability tracking on low confidence
                stableDetectionsRef.current = [];
              }
            }
          } catch (error) {
            console.error('❌ ML inference error:', error);
            stableDetectionsRef.current = [];
          } finally {
            processingRef.current = false;
            setIsProcessing(false);
          }
        }
      } else {
        // No hands detected (exactly like Python version)
        ctx.font = "20px Arial";
        ctx.fillStyle = "yellow";
        ctx.fillText("👋 Show your hand(s) to sign", 20, 40);
        // Reset stability tracking when no hands
        stableDetectionsRef.current = [];
      }
    });

    // Initialize Camera (exactly like Python cv2.VideoCapture)
    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    handsRef.current = hands;
    cameraRef.current = camera;

    // Load model data
    loadISLModelData();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [model, labelEncoder, currentSentence, speakText]);

  // Start/Stop Camera
  const toggleCamera = async () => {
    if (!cameraRef.current) return;

    if (isCameraActive) {
      cameraRef.current.stop();
      setIsCameraActive(false);
    } else {
      await cameraRef.current.start();
      setIsCameraActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <div className="w-5 h-5 text-primary-foreground">🤖</div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mute Mode - ML Pipeline</h1>
              <p className="text-muted-foreground">Camera → MediaPipe → Landmarks → Model → Output</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isModelLoaded ? "default" : "secondary"} className="text-green-600">
              {isModelLoaded ? "Model Ready" : "Loading Model..."}
            </Badge>
            <Badge variant={isCameraActive ? "default" : "secondary"} className="text-blue-600">
              {isCameraActive ? "Camera Active" : "Camera Off"}
            </Badge>
            <Badge variant="outline">FPS: {fps}</Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Section - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5">📹</div>
                    ML Camera Feed
                  </div>
                  <Badge variant={isProcessing ? "destructive" : "secondary"}>
                    {isProcessing ? "Processing" : "Idle"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* CRITICAL: Video + Canvas Layout (exactly as specified) */}
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ width: 640, height: 480 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ position: "absolute", width: 640, height: 480 }}
                  />
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    style={{ position: "absolute", width: 640, height: 480 }}
                  />
                  
                  {/* Camera Controls */}
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">📷</div>
                        <p className="text-lg text-white mb-4">
                          {isModelLoaded ? "Camera is off" : "Loading ML Model..."}
                        </p>
                        <Button
                          onClick={toggleCamera}
                          disabled={!isModelLoaded}
                          className="w-full max-w-xs"
                        >
                          Start Camera
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    onClick={toggleCamera}
                    variant={isCameraActive ? "destructive" : "default"}
                    disabled={!isModelLoaded}
                  >
                    {isCameraActive ? "🛑 Stop Camera" : "📹 Start Camera"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel - 1 column */}
          <div className="space-y-4">
            {/* Current Detection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-5 h-5">🎯</div>
                  Current Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentDetection ? (
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{currentDetection.label}</div>
                      <div className="text-xl mb-2">{(currentDetection.confidence * 100).toFixed(1)}%</div>
                      <div className="text-sm opacity-75">{currentDetection.timestamp}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <div className="text-gray-500">No detection</div>
                    <div className="text-sm text-gray-400">Start camera to begin</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sentence Construction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-5 h-5">💬</div>
                  Sentence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold mb-2 min-h-[2rem]">
                      {currentSentence || "Start signing..."}
                    </div>
                    <div className="text-sm opacity-75 mb-3">
                      Letters: {accumulatedLetters.join(' → ')}
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={clearSentence}
                        variant="outline"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={() => currentSentence && speakText(currentSentence)}
                        variant="outline"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30"
                        disabled={!currentSentence}
                      >
                        🔊 Speak
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-5 h-5">🔊</div>
                  Audio Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable Audio</span>
                  <Switch
                    checked={isAudioEnabled}
                    onCheckedChange={setIsAudioEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-Speak Signs</span>
                  <Switch
                    checked={autoSpeak}
                    onCheckedChange={setAutoSpeak}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Volume</span>
                    <span className="text-sm">{volume}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Speech Rate</span>
                    <span className="text-sm">{speechRate}x</span>
                  </div>
                  <Slider
                    value={[speechRate]}
                    onValueChange={(value) => setSpeechRate(value[0])}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recognition History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5">📜</div>
                    History
                  </div>
                  <Button
                    onClick={clearHistory}
                    variant="outline"
                    size="sm"
                    disabled={conversationHistory.length === 0}
                  >
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No history yet
                    </div>
                  ) : (
                    conversationHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="font-medium">{item.content}</span>
                        <div className="flex items-center gap-2">
                          {item.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {(item.confidence * 100).toFixed(1)}%
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">{item.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
