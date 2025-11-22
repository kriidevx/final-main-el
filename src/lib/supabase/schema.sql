-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USER PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER PREFERENCES
-- =============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  safety_alerts BOOLEAN DEFAULT TRUE,
  audio_feedback BOOLEAN DEFAULT TRUE,
  vibration_feedback BOOLEAN DEFAULT TRUE,
  visual_feedback BOOLEAN DEFAULT TRUE,
  camera_fps INTEGER DEFAULT 30,
  detection_confidence DECIMAL(3,2) DEFAULT 0.75,
  sensor_sensitivity VARCHAR(20) DEFAULT 'medium',
  yolo_model VARCHAR(50) DEFAULT 'yolov8n',
  tts_voice VARCHAR(50) DEFAULT 'Rachel',
  sign_language_model VARCHAR(50) DEFAULT 'mediapipe',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DETECTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID,
  object_type VARCHAR(100) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  distance DECIMAL(5,2),
  bbox_x INTEGER,
  bbox_y INTEGER,
  bbox_width INTEGER,
  bbox_height INTEGER,
  image_url TEXT,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TEXT-TO-SPEECH USAGE
-- =============================================
CREATE TABLE IF NOT EXISTS tts_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID,
  text TEXT NOT NULL,
  voice_id VARCHAR(100) NOT NULL,
  character_count INTEGER NOT NULL,
  audio_duration_seconds DECIMAL(10,2),
  audio_url TEXT,
  settings JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SAFETY ALERTS
-- =============================================
CREATE TABLE IF NOT EXISTS safety_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  distance DECIMAL(5,2),
  direction VARCHAR(50),
  action_taken VARCHAR(100),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER SESSIONS
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  device_type VARCHAR(50),
  device_id VARCHAR(100),
  total_detections INTEGER DEFAULT 0,
  total_alerts INTEGER DEFAULT 0,
  total_tts_requests INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SIGN LANGUAGE DETECTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS sign_language_detections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID,
  detected_sign VARCHAR(10) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  hand_landmarks JSONB,
  video_frame_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DEVICES
-- =============================================
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_name VARCHAR(100) NOT NULL,
  device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('camera', 'sensor', 'raspberry_pi', 'esp32', 'other')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('online', 'offline', 'error', 'maintenance')),
  ip_address VARCHAR(50),
  mac_address VARCHAR(50),
  firmware_version VARCHAR(50),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uptime_minutes INTEGER,
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SYSTEM LOGS
-- =============================================
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  log_level VARCHAR(20) NOT NULL CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  component VARCHAR(100),
  error_details TEXT,
  stack_trace TEXT,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYTICS SUMMARY
-- =============================================
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_detections INTEGER DEFAULT 0,
  total_alerts INTEGER DEFAULT 0,
  total_tts_requests INTEGER DEFAULT 0,
  total_session_time_minutes INTEGER DEFAULT 0,
  unique_objects_detected INTEGER DEFAULT 0,
  avg_detection_confidence DECIMAL(5,4),
  most_detected_object VARCHAR(100),
  peak_usage_hour INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_detections_timestamp ON detections(timestamp DESC);
CREATE INDEX idx_detections_user_id ON detections(user_id);
CREATE INDEX idx_detections_session_id ON detections(session_id);
CREATE INDEX idx_detections_object_type ON detections(object_type);
CREATE INDEX idx_detections_confidence ON detections(confidence);

CREATE INDEX idx_tts_timestamp ON tts_usage(timestamp DESC);
CREATE INDEX idx_tts_user_id ON tts_usage(user_id);
CREATE INDEX idx_tts_session_id ON tts_usage(session_id);

CREATE INDEX idx_alerts_timestamp ON safety_alerts(timestamp DESC);
CREATE INDEX idx_alerts_user_id ON safety_alerts(user_id);
CREATE INDEX idx_alerts_session_id ON safety_alerts(session_id);
CREATE INDEX idx_alerts_severity ON safety_alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON safety_alerts(acknowledged);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_start ON user_sessions(session_start DESC);
CREATE INDEX idx_sessions_device_id ON user_sessions(device_id);

CREATE INDEX idx_sign_lang_timestamp ON sign_language_detections(timestamp DESC);
CREATE INDEX idx_sign_lang_user_id ON sign_language_detections(user_id);
CREATE INDEX idx_sign_lang_session_id ON sign_language_detections(session_id);

CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_type ON devices(device_type);
CREATE INDEX idx_devices_last_seen ON devices(last_seen DESC);

CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_level ON system_logs(log_level);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_component ON system_logs(component);

CREATE INDEX idx_analytics_user_date ON analytics_summary(user_id, date DESC);

-- =============================================
-- VIEWS
-- =============================================

-- Daily detection statistics
CREATE OR REPLACE VIEW daily_detection_stats AS
SELECT 
  user_id,
  DATE(timestamp) as date,
  COUNT(*) as total_detections,
  COUNT(DISTINCT object_type) as unique_objects,
  AVG(confidence) as avg_confidence,
  COUNT(CASE WHEN distance < 1.0 THEN 1 END) as close_range_detections,
  MAX(timestamp) as last_detection
FROM detections
GROUP BY user_id, DATE(timestamp)
ORDER BY date DESC;

-- Hourly TTS usage
CREATE OR REPLACE VIEW hourly_tts_usage AS
SELECT 
  user_id,
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) as usage_count,
  SUM(character_count) as total_characters,
  COUNT(DISTINCT voice_id) as unique_voices_used,
  AVG(audio_duration_seconds) as avg_duration
FROM tts_usage
GROUP BY user_id, DATE_TRUNC('hour', timestamp)
ORDER BY hour DESC;

-- Alert severity distribution
CREATE OR REPLACE VIEW alert_severity_distribution AS
SELECT 
  user_id,
  severity,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY user_id), 2) as percentage
FROM safety_alerts
GROUP BY user_id, severity;

-- Object detection distribution
CREATE OR REPLACE VIEW object_detection_distribution AS
SELECT 
  user_id,
  object_type,
  COUNT(*) as count,
  AVG(confidence) as avg_confidence,
  AVG(distance) as avg_distance,
  MIN(timestamp) as first_seen,
  MAX(timestamp) as last_seen
FROM detections
GROUP BY user_id, object_type
ORDER BY count DESC;

-- Device health status
CREATE OR REPLACE VIEW device_health_status AS
SELECT 
  user_id,
  device_name,
  device_type,
  status,
  last_seen,
  uptime_minutes,
  CASE 
    WHEN status = 'online' AND last_seen > NOW() - INTERVAL '5 minutes' THEN 'healthy'
    WHEN status = 'online' AND last_seen > NOW() - INTERVAL '30 minutes' THEN 'warning'
    ELSE 'critical'
  END as health_status
FROM devices
ORDER BY last_seen DESC;

-- User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  up.id as user_id,
  up.name,
  up.email,
  COUNT(DISTINCT us.id) as total_sessions,
  COALESCE(SUM(us.duration_minutes), 0) as total_usage_minutes,
  COALESCE(SUM(us.total_detections), 0) as total_detections,
  COALESCE(SUM(us.total_alerts), 0) as total_alerts,
  MAX(us.session_start) as last_active
FROM user_profiles up
LEFT JOIN user_sessions us ON up.id = us.user_id
GROUP BY up.id, up.name, up.email;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update session duration
CREATE OR REPLACE FUNCTION update_session_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_end IS NOT NULL AND NEW.session_start IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for session duration
DROP TRIGGER IF EXISTS trigger_update_session_duration ON user_sessions;
CREATE TRIGGER trigger_update_session_duration
BEFORE UPDATE ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION update_session_duration();

-- Function to update analytics summary
CREATE OR REPLACE FUNCTION update_analytics_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_summary (
    user_id,
    date,
    total_detections,
    total_alerts,
    total_tts_requests,
    most_detected_object,
    avg_detection_confidence
  )
  SELECT 
    user_id,
    CURRENT_DATE,
    COUNT(DISTINCT CASE WHEN TG_TABLE_NAME = 'detections' THEN id END),
    COUNT(DISTINCT CASE WHEN TG_TABLE_NAME = 'safety_alerts' THEN id END),
    COUNT(DISTINCT CASE WHEN TG_TABLE_NAME = 'tts_usage' THEN id END),
    (SELECT object_type FROM detections WHERE user_id = NEW.user_id AND DATE(timestamp) = CURRENT_DATE GROUP BY object_type ORDER BY COUNT(*) DESC LIMIT 1),
    (SELECT AVG(confidence) FROM detections WHERE user_id = NEW.user_id AND DATE(timestamp) = CURRENT_DATE)
  FROM (VALUES (NEW.user_id)) AS v(user_id)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_detections = analytics_summary.total_detections + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tts_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_language_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Preferences Policies
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Detections Policies
CREATE POLICY "Users can view own detections" ON detections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own detections" ON detections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TTS Usage Policies
CREATE POLICY "Users can view own TTS usage" ON tts_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own TTS usage" ON tts_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Safety Alerts Policies
CREATE POLICY "Users can view own alerts" ON safety_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON safety_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON safety_alerts FOR UPDATE USING (auth.uid() = user_id);

-- User Sessions Policies
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Sign Language Detections Policies
CREATE POLICY "Users can view own sign detections" ON sign_language_detections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sign detections" ON sign_language_detections FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Devices Policies
CREATE POLICY "Users can view own devices" ON devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON devices FOR DELETE USING (auth.uid() = user_id);

-- System Logs Policies
CREATE POLICY "Users can view own logs" ON system_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON system_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics Summary Policies
CREATE POLICY "Users can view own analytics" ON analytics_summary FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- SEED DATA (Optional)
-- =============================================

-- Insert sample device types configuration
CREATE TABLE IF NOT EXISTS device_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_type VARCHAR(50) NOT NULL UNIQUE,
  default_config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO device_configurations (device_type, default_config) VALUES
('esp32', '{"fps": 30, "resolution": "640x480", "compression": "jpeg"}'),
('raspberry_pi', '{"fps": 60, "resolution": "1920x1080", "encoding": "h264"}'),
('camera', '{"fps": 30, "resolution": "1280x720", "format": "mjpeg"}'),
('sensor', '{"sample_rate": 100, "sensitivity": "medium"}')
ON CONFLICT (device_type) DO NOTHING;