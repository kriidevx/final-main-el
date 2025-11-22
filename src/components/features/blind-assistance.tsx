"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Eye, Navigation, AlertTriangle, Volume2 } from "lucide-react";

export default function BlindAssistance() {
  const features = [
    {
      icon: Eye,
      title: "AI Vision",
      description: "Real-time object detection and scene understanding using YOLO",
    },
    {
      icon: Navigation,
      title: "Obstacle Detection",
      description: "Advanced path analysis with distance measurement and direction",
    },
    {
      icon: AlertTriangle,
      title: "Safety Alerts",
      description: "Immediate audio warnings for potential hazards",
    },
    {
      icon: Volume2,
      title: "Audio Guidance",
      description: "Natural voice descriptions of surroundings and detected objects",
    },
  ];

  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            For the <span className="text-blue-400">Visually Impaired</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Navigate your world with confidence using AI-powered vision assistance
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="glass-effect border-white/10 hover:border-blue-500/50 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}