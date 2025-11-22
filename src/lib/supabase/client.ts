"use client";

import { createClient } from '@supabase/supabase-js';
import type { 
  Detection, 
  TTSUsage, 
  SafetyAlert, 
  SignLanguageDetection,
  UserSession,
  Device,
  SystemLog,
  AnalyticsSummary,
  UserPreferences
} from '../../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Detection Functions
export async function createDetection(detection: Omit<Detection, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('detections')
    .insert([detection])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getDetections(userId: string, limit = 100) {
  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

// TTS Functions
export async function createTTSUsage(ttsUsage: Omit<TTSUsage, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('tts_usage')
    .insert([ttsUsage])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getTTSUsage(userId: string, limit = 100) {
  const { data, error } = await supabase
    .from('tts_usage')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

// Safety Alert Functions
export async function createSafetyAlert(alert: Omit<SafetyAlert, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('safety_alerts')
    .insert([alert])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getSafetyAlerts(userId: string, limit = 100) {
  const { data, error } = await supabase
    .from('safety_alerts')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

export async function acknowledgeSafetyAlert(alertId: string) {
  const { data, error } = await supabase
    .from('safety_alerts')
    .update({ 
      acknowledged: true, 
      acknowledged_at: new Date().toISOString() 
    })
    .eq('id', alertId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Sign Language Functions
export async function createSignLanguageDetection(detection: Omit<SignLanguageDetection, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('sign_language_detections')
    .insert([detection])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getSignLanguageDetections(userId: string, limit = 100) {
  const { data, error } = await supabase
    .from('sign_language_detections')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

// Session Functions
export async function createUserSession(session: Omit<UserSession, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('user_sessions')
    .insert([session])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function endUserSession(sessionId: string) {
  const { data, error } = await supabase
    .from('user_sessions')
    .update({ 
      session_end: new Date().toISOString() 
    })
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getUserSessions(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('session_start', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
}

// Device Functions
export async function getDevices(userId: string) {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .order('last_seen', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function updateDeviceStatus(deviceId: string, status: string) {
  const { data, error } = await supabase
    .from('devices')
    .update({ 
      status, 
      last_seen: new Date().toISOString() 
    })
    .eq('id', deviceId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Analytics Functions
export async function getAnalyticsSummary(userId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('analytics_summary')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
}

// User Preferences Functions
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
  const { data, error } = await supabase
    .from('user_preferences')
    .update({ ...preferences, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// System Logs
export async function createSystemLog(log: Omit<SystemLog, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('system_logs')
    .insert([log])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}