"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Settings,
  Mic,
  Clock,
  MessageSquare
} from 'lucide-react';

interface AudioMessage {
  id: string;
  text: string;
  type: 'obstacle' | 'object' | 'navigation' | 'system';
  timestamp: Date;
  duration: number;
  priority: 'low' | 'medium' | 'high';
}

interface AudioGuidancePanelProps {
  isActive: boolean;
}

export function AudioGuidancePanel({ isActive }: AudioGuidancePanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [speechRate, setSpeechRate] = useState([1.0]);
  const [autoPlay, setAutoPlay] = useState(true);
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<AudioMessage | null>(null);

  // Simulate audio messages
  useEffect(() => {
    if (!isActive) {
      setMessages([]);
      setCurrentMessage(null);
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      const mockMessages: AudioMessage[] = [
        {
          id: '1',
          text: 'Person detected 2.3 meters ahead. Please proceed with caution.',
          type: 'obstacle',
          timestamp: new Date(),
          duration: 3.5,
          priority: 'high'
        },
        {
          id: '2',
          text: 'Chair located to your left at 1.5 meters.',
          type: 'object',
          timestamp: new Date(),
          duration: 2.8,
          priority: 'medium'
        },
        {
          id: '3',
          text: 'Wall detected 0.8 meters ahead. Stop immediately.',
          type: 'obstacle',
          timestamp: new Date(),
          duration: 3.2,
          priority: 'high'
        },
        {
          id: '4',
          text: 'Door detected straight ahead at 3 meters.',
          type: 'navigation',
          timestamp: new Date(),
          duration: 2.5,
          priority: 'medium'
        },
        {
          id: '5',
          text: 'Path is clear for the next 5 meters.',
          type: 'system',
          timestamp: new Date(),
          duration: 2.0,
          priority: 'low'
        }
      ];

      // Add random message
      if (Math.random() > 0.7) {
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        const newMessage = {
          ...randomMessage,
          id: Date.now().toString(),
          timestamp: new Date()
        };
        
        setMessages(prev => [newMessage, ...prev].slice(0, 10));
        
        if (autoPlay && !isPlaying) {
          playMessage(newMessage);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, autoPlay, isPlaying]);

  const playMessage = (message: AudioMessage) => {
    setCurrentMessage(message);
    setIsPlaying(true);
    
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false);
      setCurrentMessage(null);
    }, message.duration * 1000);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentMessage(null);
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'obstacle': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'object': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'navigation': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'system': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-purple-600" />
          Audio Guidance
        </CardTitle>
        <CardDescription>
          Text-to-speech feedback for obstacle and object detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isPlaying ? "destructive" : "default"}
              onClick={isPlaying ? stopPlayback : () => messages[0] && playMessage(messages[0])}
              disabled={!isActive || messages.length === 0}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">{volume[0]}%</span>
            </div>
          </div>
          
          <Badge variant={isPlaying ? "default" : "secondary"}>
            {isPlaying ? 'Speaking' : 'Idle'}
          </Badge>
        </div>

        {/* Current Message */}
        {currentMessage && (
          <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Now Speaking</span>
              </div>
              <Badge variant={getPriorityColor(currentMessage.priority)}>
                {currentMessage.priority}
              </Badge>
            </div>
            <p className="text-sm mb-2">{currentMessage.text}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Type: {currentMessage.type}</span>
              <span>Duration: {currentMessage.duration}s</span>
            </div>
            
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-1000"
                style={{
                  width: isPlaying ? '100%' : '0%',
                  animation: isPlaying ? `progress ${currentMessage.duration}s linear` : 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Audio Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Audio Settings</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Volume</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={5}
                  className="w-24"
                />
                <span className="text-sm w-10">{volume[0]}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Speech Rate</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={speechRate}
                  onValueChange={setSpeechRate}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-24"
                />
                <span className="text-sm w-10">{speechRate[0]}x</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Auto-play Messages</label>
              <Switch 
                checked={autoPlay}
                onCheckedChange={setAutoPlay}
              />
            </div>
          </div>
        </div>

        {/* Message History */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Recent Messages</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {messages.length > 0 ? (
              messages.slice(0, 5).map((message) => (
                <div 
                  key={message.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getMessageTypeColor(message.type)}>
                        {message.type}
                      </Badge>
                      <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                        {message.priority}
                      </Badge>
                    </div>
                    <p className="text-sm line-clamp-2">{message.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => playMessage(message)}
                    disabled={isPlaying}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Mic className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {isActive ? 'No messages yet' : 'Start assistance to receive audio guidance'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{messages.length}</div>
            <div className="text-xs text-muted-foreground">Total Messages</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {messages.filter(m => m.priority === 'high').length}
            </div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{volume[0]}%</div>
            <div className="text-xs text-muted-foreground">Volume Level</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
