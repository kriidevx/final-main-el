"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  MicOff, 
  MessageSquare, 
  Navigation, 
  Settings,
  Activity,
  Users,
  Camera,
  Volume2,
  Brain,
  Hand
} from "lucide-react";

export default function DashboardPage() {
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const modes = [
    {
      id: 'blind-mode',
      title: 'Blind Mode',
      description: 'AI-powered object detection with audio guidance for visually impaired users',
      icon: Eye,
      status: 'ready',
      features: ['Object Detection', 'Audio Guidance', 'Navigation Assistant', 'Real-time Camera'],
      color: 'bg-blue-500',
      href: '/dashboard/blind-mode'
    },
    {
      id: 'mute-mode',
      title: 'Mute Mode',
      description: 'Indian Sign Language recognition with MLP model and real-time translation',
      icon: Hand,
      status: 'ready',
      features: ['ISL Recognition', 'MLP Model', 'Label Encoder', 'Voice Translation'],
      color: 'bg-green-500',
      href: '/dashboard/mute-mode'
    },
    {
      id: 'deaf-mode',
      title: 'Deaf Mode',
      description: 'Live speech-to-text captions with conversation history for hearing impaired users',
      icon: Volume2,
      status: 'ready',
      features: ['Live Captions', 'Speech-to-Text', 'Conversation History', 'Audio Recording'],
      color: 'bg-purple-500',
      href: '/dashboard/deaf-mode'
    },
    {
      id: 'speech-mode',
      title: 'Speech Mode',
      description: 'Speech recognition and voice-controlled assistance',
      icon: MicOff,
      status: 'coming-soon',
      features: ['Voice Commands', 'Speech Recognition', 'AI Assistant'],
      color: 'bg-orange-500',
      href: '/dashboard/speech-mode'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '1,234', change: '+12%', icon: Users },
    { label: 'Detections Today', value: '5,678', change: '+23%', icon: Camera },
    { label: 'Translations', value: '890', change: '+8%', icon: MessageSquare },
    { label: 'System Health', value: '98%', change: '+2%', icon: Activity }
  ];

  return (
    <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Vision Beyond EL Dashboard</h1>
                <p className="text-muted-foreground">
                  Accessibility assistance platform for differently-abled users
                </p>
              </div>
              <Badge variant="outline" className="text-green-600">
                System Online
              </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="border-border/40 backdrop-blur-xl bg-card/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-green-600">{stat.change}</p>
                        </div>
                        <Icon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Card key={mode.id} className="border-border/40 backdrop-blur-xl bg-card/50 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg ${mode.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{mode.title}</CardTitle>
                            <Badge 
                              variant={mode.status === 'ready' ? 'default' : 'secondary'}
                              className="mt-1"
                            >
                              {mode.status === 'ready' ? 'Ready' : 'Coming Soon'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{mode.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Features */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {mode.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.location.href = mode.href}
                          disabled={mode.status !== 'ready'}
                          className="flex-1"
                        >
                          {mode.status === 'ready' ? `Launch ${mode.title}` : 'Coming Soon'}
                        </Button>
                        
                        {mode.status === 'ready' && (
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="border-border/40 backdrop-blur-xl bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Model Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">YOLO Detection</h4>
                    <p className="text-sm text-muted-foreground">Object detection model</p>
                    <Badge variant="outline" className="mt-2 text-green-600">Active</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">ISL MLP Model</h4>
                    <p className="text-sm text-muted-foreground">Sign language recognition</p>
                    <Badge variant="outline" className="mt-2 text-green-600">Trained</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Label Encoder</h4>
                    <p className="text-sm text-muted-foreground">Classification labels</p>
                    <Badge variant="outline" className="mt-2 text-green-600">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
    </div>
  );
}