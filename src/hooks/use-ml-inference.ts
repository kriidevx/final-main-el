import { useState, useCallback } from 'react';
import { detectObjects, detectObjectsFromVideo } from '../lib/ml/yolo-client';
import { signLanguageClient, type SignLanguageDetection } from '../lib/ml/sign-language-client';
import type { BoundingBox } from '../types';

export interface YOLODetection {
  class: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface YOLOResponse {
  detections: YOLODetection[];
  inference_time: number;
}

export interface YOLOClient {
  detect: (image: string, options?: { confidence?: number; model?: string }) => Promise<YOLOResponse>;
  detectFromVideo: (videoElement: HTMLVideoElement) => Promise<BoundingBox[]>;
}

export const yoloClient: YOLOClient = {
  detect: async (image: string, options?: { confidence?: number; model?: string }) => {
    try {
      const detections = await detectObjects(image);
      return {
        detections: detections.map(d => ({
          class: 'object',
          confidence: 0.95,
          bbox: d
        })),
        inference_time: 50
      };
    } catch (error) {
      console.error('YOLO detection error:', error);
      return {
        detections: [],
        inference_time: 0
      };
    }
  },
  detectFromVideo: async (videoElement: HTMLVideoElement) => {
    return detectObjectsFromVideo(videoElement);
  }
};

export function useYOLODetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<YOLODetection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inferenceTime, setInferenceTime] = useState<number>(0);

  const detect = useCallback(async (
    image: string,
    options?: { confidence?: number; model?: string }
  ) => {
    setIsDetecting(true);
    setError(null);

    try {
      const result = await yoloClient.detect(image, options);
      setDetections(result.detections);
      setInferenceTime(result.inference_time);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Detection failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const detectFromVideo = useCallback(async (
    videoElement: HTMLVideoElement,
    options?: { confidence?: number; model?: string }
  ) => {
    // Create canvas to capture video frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(videoElement, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    return detect(imageData, options);
  }, [detect]);

  const clearDetections = useCallback(() => {
    setDetections([]);
    setError(null);
  }, []);

  return {
    isDetecting,
    detections,
    error,
    inferenceTime,
    detect,
    detectFromVideo,
    clearDetections
  };
}

export function useSignLanguageDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentSign, setCurrentSign] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [signHistory, setSignHistory] = useState<SignLanguageDetection[]>([]);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async (image: string) => {
    setIsDetecting(true);
    setError(null);

    try {
      const result = await signLanguageClient.detect(image);
      setCurrentSign(result.detected_sign);
      setConfidence(result.confidence);
      
      if (result.detected_sign && result.confidence > 0.7) {
        setSignHistory(prev => [{
          detected_sign: result.detected_sign!,
          confidence: result.confidence,
          landmarks: result.landmarks,
          timestamp: result.timestamp
        }, ...prev.slice(0, 9)]);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Detection failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  const detectFromVideo = useCallback(async (videoElement: HTMLVideoElement) => {
    return signLanguageClient.detectFromVideoFrame(videoElement);
  }, []);

  const clearHistory = useCallback(() => {
    setSignHistory([]);
    setCurrentSign(null);
    setConfidence(0);
    setError(null);
  }, []);

  const buildPhrase = useCallback(() => {
    return signHistory
      .map(h => h.detected_sign)
      .reverse()
      .join('');
  }, [signHistory]);

  return {
    isDetecting,
    currentSign,
    confidence,
    signHistory,
    error,
    detect,
    detectFromVideo,
    clearHistory,
    buildPhrase
  };
}

export function useMLInference() {
  const yolo = useYOLODetection();
  const signLanguage = useSignLanguageDetection();

  return {
    yolo,
    signLanguage
  };
}