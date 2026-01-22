"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Mic, MicOff, Volume2, Play, Pause, Trash2, Save, Clock, MessageSquare } from "lucide-react";

interface ConversationItem {
  id: string;
  text: string;
  timestamp: string;
  duration?: number;
}

interface GeminiResponse {
  text: string;
  confidence: number;
  timestamp: string;
}

export default function DeafModePage() {
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State variables
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<ConversationItem[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(75);
  const [speechRate, setSpeechRate] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  // Timer ref for recording duration
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start recording
  const startRecording = async () => {
    try {
      console.log('🎤 Starting audio recording...');
      setErrorMessage('');
      setSuccessMessage('');
      setCurrentTranscript('');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = async () => {
        console.log('🛑 Recording stopped, processing audio...');
        setIsProcessing(true);
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Combine audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const duration = recordingTime;
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Create audio URL for playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        console.log('🎵 Audio URL created:', url);
        
        // Send to Murf AI for transcription
        await transcribeAudio(audioBlob, duration);
        
        setIsProcessing(false);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setSuccessMessage('Recording... Speak clearly!');
      console.log('✅ Recording started');
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      setErrorMessage('Failed to access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(recordingTime);
    }
  };

  // Transcribe audio using Whisper API
  const transcribeAudio = async (audioBlob: Blob, duration: number) => {
    try {
      console.log('🤖 Sending audio to Whisper API for transcription...');
      setErrorMessage('');
      setSuccessMessage('Processing audio...');
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        console.log('📦 Audio converted to base64, length:', base64Audio.length);
        console.log('🎤 Audio blob size:', audioBlob.size, 'bytes');
        
        try {
          // Call Whisper API
          const response = await fetch('/api/gemini/speech-to-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audio: base64Audio,
              duration: duration,
              language: 'en',
              model: 'base'
            })
          });
          
          console.log('📡 API Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', errorText);
            setErrorMessage(`API Error: ${response.status} - ${errorText}`);
            setCurrentTranscript('Failed to transcribe audio. Please try again.');
            return;
          }
          
          const result = await response.json();
          console.log('📥 Full API Response:', result);
          console.log('📝 Transcript:', result.transcript);
          console.log('📊 Note:', result.note);
          
          if (result.success && result.transcript && result.transcript.trim()) {
            console.log('✅ Transcription received:', result.transcript);
            setSuccessMessage('Transcription successful!');
            
            // Add to conversation history
            const conversationItem: ConversationItem = {
              id: Date.now().toString(),
              text: result.transcript,
              timestamp: new Date().toLocaleTimeString(),
              duration: duration
            };
            
            setConversationHistory(prev => [conversationItem, ...prev]);
            setCurrentTranscript(result.transcript);
            
            // Auto-play text if enabled
            if (autoPlay && isAudioEnabled) {
              speakText(result.transcript);
            }
            
          } else {
            console.error('❌ Transcription failed or empty:', result);
            const errorMsg = result.error || 'No speech detected in audio';
            setErrorMessage(`Transcription issue: ${errorMsg}`);
            setCurrentTranscript('No speech detected. Please speak clearly and try again.');
          }
        } catch (error) {
          console.error('❌ Network error:', error);
          setErrorMessage('Network error. Please check your connection.');
          setCurrentTranscript('Error processing audio. Please try again.');
        }
      };
      
    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      setErrorMessage('Error processing audio. Please try again.');
      setCurrentTranscript('Error processing audio. Please try again.');
    }
  };
  const deleteConversationItem = (id: string) => {
    setConversationHistory(prev => prev.filter(item => item.id !== id));
  };

  // Text-to-speech
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window && isAudioEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.volume = volume / 100;
      utterance.pitch = 1;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [isAudioEnabled, volume, speechRate]);

  // Play audio recording (for conversation history)
  const playAudioRecording = (audioBlob: Blob) => {
    if (audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  // Clear conversation history
  const clearHistory = () => {
    setConversationHistory([]);
    setCurrentTranscript('');
    setErrorMessage('');
    setSuccessMessage('');
    speakText('Conversation history cleared');
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Deaf Mode - Live Captions</h1>
              <p className="text-muted-foreground">Speech-to-text with conversation history</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isRecording ? "destructive" : "secondary"} className="text-red-600">
              {isRecording ? "Recording" : "Ready"}
            </Badge>
            <Badge variant={isProcessing ? "destructive" : "secondary"} className="text-blue-600">
              {isProcessing ? "Processing" : "Idle"}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recording Section - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Voice Recording
                  </div>
                  <div className="flex items-center gap-2">
                    {isRecording && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(recordingTime)}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Recording Interface */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 mb-6">
                  <div className="text-center">
                    {/* Recording Button */}
                    <div className="mb-6">
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isProcessing}
                        size="lg"
                        variant={isRecording ? "destructive" : "default"}
                        className="w-32 h-32 rounded-full text-2xl font-bold shadow-lg hover:shadow-xl transition-all"
                      >
                        {isRecording ? (
                          <div className="flex flex-col items-center">
                            <MicOff className="w-12 h-12 mb-2" />
                            Stop
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Mic className="w-12 h-12 mb-2" />
                            Record
                          </div>
                        )}
                      </Button>
                    </div>
                    
                    {/* Status Text */}
                    <div className="text-lg font-medium mb-2">
                      {isRecording ? (
                        <span className="text-red-600 animate-pulse">
                          🎤 Recording... Speak clearly
                        </span>
                      ) : isProcessing ? (
                        <span className="text-blue-600">
                          🤖 Processing audio...
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          Press Record to start capturing speech
                        </span>
                      )}
                    </div>
                    
                    {/* Recording Duration */}
                    {recordingDuration > 0 && !isRecording && (
                      <div className="text-sm text-gray-500">
                        Last recording: {formatTime(recordingDuration)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Messages */}
                {(errorMessage || successMessage) && (
                  <div className={`mb-4 p-4 rounded-lg border ${
                    errorMessage ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {errorMessage ? (
                        <>
                          <div className="w-4 h-4 text-red-500">❌</div>
                          <p className="text-red-700">{errorMessage}</p>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 text-green-500">✅</div>
                          <p className="text-green-700">{successMessage}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Current Transcript */}
                {currentTranscript && (
                  <Card className="mb-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-4 h-4" />
                        Current Transcript
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-4 rounded-lg border">
                        <p className="text-lg leading-relaxed">{currentTranscript}</p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => speakText(currentTranscript)}
                            variant="outline"
                            size="sm"
                            disabled={isPlaying}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {isPlaying ? 'Playing...' : 'Play Text'}
                          </Button>
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(currentTranscript);
                              speakText('Text copied to clipboard');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Audio Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Audio Settings</CardTitle>
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
                        <span className="text-sm">Auto-Play Text</span>
                        <Switch
                          checked={autoPlay}
                          onCheckedChange={setAutoPlay}
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={clearHistory}
                        variant="outline"
                        className="w-full"
                        disabled={conversationHistory.length === 0}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear History
                      </Button>
                      
                      <Button
                        onClick={() => {
                          const historyText = conversationHistory.map(item => 
                            `${item.timestamp}: ${item.text}`
                          ).join('\n');
                          const blob = new Blob([historyText], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `conversation-${Date.now()}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        variant="outline"
                        className="w-full"
                        disabled={conversationHistory.length === 0}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Conversation
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel - 1 column */}
          <div className="space-y-4">
            {/* Conversation History */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Conversation History
                  </div>
                  <Badge variant="outline">
                    {conversationHistory.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No conversation yet</p>
                      <p className="text-sm">Start recording to see transcripts</p>
                    </div>
                  ) : (
                    conversationHistory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {item.timestamp}
                            </p>
                            <p className="text-sm leading-relaxed">
                              {item.text}
                            </p>
                            {item.duration && (
                              <p className="text-xs text-gray-500 mt-1">
                                Duration: {formatTime(item.duration)}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              onClick={() => speakText(item.text)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={isPlaying}
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => deleteConversationItem(item.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
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

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
