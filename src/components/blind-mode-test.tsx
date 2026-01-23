"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Volume2, 
  Play, 
  Pause, 
  Settings,
  VolumeX,
  Volume1,
  Volume2 as VolumeHigh
} from "lucide-react";

interface DetectedObject {
  id: string;
  name: string;
  confidence: number;
  position: { x: number; y: number; width: number; height: number };
  distance: number;
  timestamp: string;
}

interface AudioMessage {
  id: string;
  type: 'navigation' | 'obstacle' | 'object';
  priority: 'high' | 'medium' | 'low';
  text: string;
  timestamp: string;
}

export default function BlindModeTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [speechRate, setSpeechRate] = useState(1);
  const [autoPlayMessages, setAutoPlayMessages] = useState(true);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [recentMessages, setRecentMessages] = useState<AudioMessage[]>([]);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [csvData, setCsvData] = useState<any[]>([]);

  // Load CSV data on mount
  useEffect(() => {
    loadCSVData();
  }, []);

  const loadCSVData = async () => {
    try {
      const response = await fetch('/ml-models/yolo/detections.csv');
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      // Skip header and parse data
      const detections = lines.slice(1).map(line => {
        const [timestamp, label, confidence, x1, y1, x2, y2] = line.split(',');
        return {
          timestamp,
          label: label.trim(),
          confidence: parseFloat(confidence),
          x1: parseInt(x1),
          y1: parseInt(y1),
          x2: parseInt(x2),
          y2: parseInt(y2)
        };
      }).filter(d => d.label && !isNaN(d.confidence));

      setCsvData(detections);
      console.log('Loaded CSV data:', detections);
    } catch (error) {
      console.error('Error loading CSV:', error);
    }
  };

  // Initialize camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        startObjectDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      speakText('Camera access denied. Please allow camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  // Text-to-speech function
  const speakText = (text: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.volume = volume / 100;
      utterance.pitch = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.onstart = () => setIsAudioPlaying(true);
      utterance.onend = () => setIsAudioPlaying(false);
      
      window.speechSynthesis.speak(utterance);
      
      const newMessage: AudioMessage = {
        id: Date.now().toString(),
        type: text.toLowerCase().includes('detected') ? 'object' : 
             text.toLowerCase().includes('wall') || text.toLowerCase().includes('obstacle') ? 'obstacle' : 'navigation',
        priority,
        text,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      setRecentMessages(prev => [newMessage, ...prev].slice(0, 10));
    }
  };

  // Object detection using CSV data
  const startObjectDetection = () => {
    let detectionIndex = 0;
    
    const detectionInterval = setInterval(() => {
      if (!isCameraActive || csvData.length === 0) {
        clearInterval(detectionInterval);
        return;
      }

      const detection = csvData[detectionIndex % csvData.length];
      
      const newObject: DetectedObject = {
        id: Date.now().toString(),
        name: detection.label,
        confidence: detection.confidence * 100,
        position: {
          x: detection.x1,
          y: detection.y1,
          width: detection.x2 - detection.x1,
          height: detection.y2 - detection.y1
        },
        distance: estimateDistance(detection.x2 - detection.x1, detection.y2 - detection.y1),
        timestamp: detection.timestamp
      };

      setDetectedObjects(prev => [newObject, ...prev].slice(0, 5));
      
      setDetectedObjects(current => {
        const avg = current.length > 0 
          ? current.reduce((sum, obj) => sum + obj.confidence, 0) / current.length 
          : 0;
        setAvgConfidence(avg);
        return current;
      });

      // Generate audio message
      let message = '';
      let priority: 'high' | 'medium' | 'low' = 'medium';
      
      const distance = newObject.distance;
      
      if (detection.label === 'person') {
        if (distance < 2) {
          message = `Person detected very close at ${distance.toFixed(1)} meters. Be careful.`;
          priority = 'high';
        } else {
          message = `Person detected at ${distance.toFixed(1)} meters ahead.`;
          priority = 'medium';
        }
      } else if (detection.label === 'bottle') {
        message = `Bottle detected at ${distance.toFixed(1)} meters.`;
        priority = 'low';
      } else if (detection.label === 'bird') {
        message = `Bird detected at ${distance.toFixed(1)} meters.`;
        priority = 'low';
      } else {
        message = `${detection.label} detected at ${distance.toFixed(1)} meters.`;
        priority = 'medium';
      }

      if (autoPlayMessages) {
        speakText(message, priority);
      }

      detectionIndex++;
    }, 2000);

    return () => clearInterval(detectionInterval);
  };

  const estimateDistance = (width: number, height: number) => {
    const area = width * height;
    const maxArea = 640 * 480;
    const normalizedSize = area / maxArea;
    
    if (normalizedSize > 0.5) return 0.5;
    if (normalizedSize > 0.3) return 1.0;
    if (normalizedSize > 0.1) return 2.0;
    if (normalizedSize > 0.05) return 3.5;
    return 5.0;
  };

  // Draw detection boxes on canvas
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const drawDetections = () => {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      detectedObjects.forEach(obj => {
        ctx.strokeStyle = obj.distance < 1 ? '#ef4444' : '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.position.x, obj.position.y, obj.position.width, obj.position.height);

        ctx.fillStyle = obj.distance < 1 ? '#ef4444' : '#22c55e';
        ctx.fillRect(obj.position.x, obj.position.y - 25, obj.position.width, 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.fillText(
          `${obj.name} (${obj.confidence.toFixed(1)}%)`, 
          obj.position.x + 5, 
          obj.position.y - 8
        );
      });

      requestAnimationFrame(drawDetections);
    };

    drawDetections();
  }, [detectedObjects, isCameraActive]);

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return VolumeHigh;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Blind Mode - Test Interface</h1>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CSV Data Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Total Detections:</span> {csvData.length}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Objects:</span> {Array.from(new Set(csvData.map(d => d.label))).join(', ')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Camera:</span> 
                  <Badge variant={isCameraActive ? "default" : "secondary"} className="ml-2">
                    {isCameraActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detection Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Current Objects:</span> {detectedObjects.length}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Avg Confidence:</span> {avgConfidence.toFixed(1)}%
                </p>
                <p className="text-sm">
                  <span className="font-medium">Audio:</span>
                  <Badge variant={isAudioPlaying ? "default" : "secondary"} className="ml-2">
                    {isAudioPlaying ? "Playing" : "Idle"}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className="w-full"
                  variant={isCameraActive ? "destructive" : "default"}
                >
                  {isCameraActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isCameraActive ? "Stop Camera" : "Start Camera"}
                </Button>
                
                <div className="flex items-center gap-2">
                  <VolumeIcon className="w-4 h-4" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">{volume}%</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoPlayMessages}
                    onChange={(e) => setAutoPlayMessages(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Auto-play Audio</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Camera View */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Camera View with Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
              />
              
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full ${!isCameraActive ? 'hidden' : ''}`}
              />
              
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center text-white">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p>Camera is inactive</p>
                    <p className="text-sm mt-2">Click &quot;Start Camera&quot; to begin</p>
                  </div>
                </div>
              )}
              
              {isCameraActive && detectedObjects.length > 0 && (
                <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded">
                  <p className="text-sm font-medium">{detectedObjects.length} object{detectedObjects.length !== 1 ? 's' : ''}</p>
                  <p className="text-xs">{detectedObjects[0]?.name} ({detectedObjects[0]?.confidence.toFixed(1)}%)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Audio Messages ({recentMessages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No messages yet. Start camera to begin detection.
                </p>
              ) : (
                recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg border ${
                      message.priority === 'high' 
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : message.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium capitalize">{message.type}</span>
                      <Badge variant="outline" className="text-xs">{message.priority}</Badge>
                    </div>
                    <p className="text-sm mb-1">{message.text}</p>
                    <p className="text-xs opacity-75">{message.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
