"use client";

// User Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  safety_alerts: boolean;
  audio_feedback: boolean;
  vibration_feedback: boolean;
  visual_feedback: boolean;
  camera_fps: number;
  detection_confidence: number;
  sensor_sensitivity: 'low' | 'medium' | 'high';
  yolo_model: string;
  tts_voice: string;
  sign_language_model: string;
  created_at: string;
  updated_at: string;
}

// ML Detection Types
export interface Detection {
  id: string;
  user_id: string;
  session_id?: string;
  object_type: string;
  confidence: number;
  distance?: number;
  bbox_x?: number;
  bbox_y?: number;
  bbox_width?: number;
  bbox_height?: number;
  image_url?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color?: string;
}

// Sign Language Types
export interface SignLanguageDetection {
  id: string;
  user_id: string;
  session_id?: string;
  detected_sign: string;
  confidence: number;
  hand_landmarks?: Record<string, any>;
  video_frame_url?: string;
  timestamp: string;
  created_at: string;
}

// TTS Types
export interface TTSUsage {
  id: string;
  user_id: string;
  session_id?: string;
  text: string;
  voice_id: string;
  character_count: number;
  audio_duration_seconds?: number;
  audio_url?: string;
  settings?: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface TTSVoice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
}

// Safety Alert Types
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SafetyAlert {
  id: string;
  user_id: string;
  session_id?: string;
  alert_type: string;
  severity: AlertSeverity;
  message: string;
  distance?: number;
  direction?: string;
  action_taken?: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  created_at: string;
}

// Session Types
export interface UserSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  duration_minutes?: number;
  device_type?: string;
  device_id?: string;
  total_detections: number;
  total_alerts: number;
  total_tts_requests: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Device Types
export type DeviceType = 'camera' | 'sensor' | 'raspberry_pi' | 'esp32' | 'other';
export type DeviceStatus = 'online' | 'offline' | 'error' | 'maintenance';

export interface Device {
  id: string;
  user_id: string;
  device_name: string;
  device_type: DeviceType;
  status: DeviceStatus;
  ip_address?: string;
  mac_address?: string;
  firmware_version?: string;
  last_seen: string;
  uptime_minutes?: number;
  configuration?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Raspberry Pi Types
export interface RaspberryPiStreamData {
  frame: string;
  timestamp: string;
  sensor_data?: {
    temperature?: number;
    humidity?: number;
    proximity?: number;
  };
}

// System Log Types
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface SystemLog {
  id: string;
  user_id?: string;
  log_level: LogLevel;
  message: string;
  component?: string;
  error_details?: string;
  stack_trace?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  created_at: string;
}

// Analytics Types
export interface AnalyticsSummary {
  id: string;
  user_id: string;
  date: string;
  total_detections: number;
  total_alerts: number;
  total_tts_requests: number;
  total_session_time_minutes: number;
  unique_objects_detected: number;
  avg_detection_confidence?: number;
  most_detected_object?: string;
  peak_usage_hour?: number;
  created_at: string;
  updated_at: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'stream' | 'detection' | 'alert' | 'status';
  data: any;
  timestamp: string;
}