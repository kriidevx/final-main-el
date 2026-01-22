"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Hand, 
  Mic, 
  MicOff,
  ArrowRight,
  Shield,
  Users,
  MessageCircle,
  Activity
} from "lucide-react";

export default function DashboardPage() {
  const modes = [
    {
      title: "Blind Mode",
      description: "Visual assistance with obstacle detection and object recognition",
      icon: EyeOff,
      color: "blue",
      href: "/blind-mode",
      features: [
        "Real-time obstacle detection",
        "Object recognition with audio feedback",
        "Distance measurement and warnings",
        "LED visual indicators"
      ],
      stats: {
        users: "2.3k",
        accuracy: "94.2%",
        alerts: "47"
      }
    },
    {
      title: "Deaf Mode", 
      description: "Hearing assistance with live captions and sound alerts",
      icon: VolumeX,
      color: "green",
      href: "/deaf-mode",
      features: [
        "Live speech-to-text captions",
        "Sound classification and alerts",
        "Multi-speaker identification",
        "Conversation history"
      ],
      stats: {
        users: "1.8k", 
        accuracy: "96.1%",
        alerts: "23"
      }
    },
    {
      title: "Mute Mode",
      description: "Speech assistance with sign language detection and text-to-speech",
      icon: MicOff,
      color: "purple",
      href: "/mute-mode",
      features: [
        "Indian Sign Language detection",
        "Text-to-speech conversion",
        "Point and speak functionality",
        "Quick phrase library"
      ],
      stats: {
        users: "1.2k",
        accuracy: "91.8%", 
        alerts: "15"
      }
    }
  ];

  const recentActivity = [
    { type: "Detection", object: "Person detected", mode: "Blind", time: "2 mins ago" },
    { type: "Alert", object: "Car horn", mode: "Deaf", time: "5 mins ago" },
    { type: "Translation", object: "ISL sign detected", mode: "Mute", time: "8 mins ago" },
    { type: "Warning", object: "Obstacle nearby", mode: "Blind", time: "12 mins ago" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome to Vision Beyond EL
        </h1>
        <p className="text-muted-foreground">
          Choose your accessibility mode to get started with personalized assistance
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full bg-${mode.color}-100 dark:bg-${mode.color}-900/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 text-${mode.color}-600 dark:text-${mode.color}-400`} />
                </div>
                <CardTitle className="text-xl">{mode.title}</CardTitle>
                <CardDescription className="text-sm">
                  {mode.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Features:</h4>
                  <ul className="space-y-1">
                    {mode.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{mode.stats.users}</div>
                    <div className="text-xs text-muted-foreground">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{mode.stats.accuracy}</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{mode.stats.alerts}</div>
                    <div className="text-xs text-muted-foreground">Alerts</div>
                  </div>
                </div>

                {/* Action Button */}
                <Link href={mode.href}>
                  <Button className="w-full group-hover:bg-primary/90 transition-colors">
                    Launch {mode.title}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity Across All Modes
          </CardTitle>
          <CardDescription>
            Latest detections, alerts, and translations from all accessibility modes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={activity.type === "Alert" ? "destructive" : "secondary"}>
                    {activity.type}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{activity.object}</p>
                    <p className="text-xs text-muted-foreground">Mode: {activity.mode}</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">5.3k</div>
                <div className="text-xs text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">94.7%</div>
                <div className="text-xs text-muted-foreground">System Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">12.8k</div>
                <div className="text-xs text-muted-foreground">Daily Interactions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">85</div>
                <div className="text-xs text-muted-foreground">Active Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}