"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Bell, Lightbulb, Radio, ArrowRight } from "lucide-react";

export default function DeafAssistance() {
  const features = [
    {
      icon: Lightbulb,
      title: "LED Alert System",
      description: "Color-coded visual notifications for different types of alerts",
      color: "purple",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Visual alerts for doorbells, alarms, and important sounds",
      color: "purple",
    },
    {
      icon: Radio,
      title: "Vibration Feedback",
      description: "Haptic alerts for immediate attention and awareness",
      color: "purple",
    },
    {
      icon: ArrowRight,
      title: "Directional Indicators",
      description: "Visual cues showing the source and direction of sounds",
      color: "purple",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            For the <span className="text-purple-400">Hearing Impaired</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Stay connected with visual and haptic alert systems
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="glass-effect border-white/10 hover:border-purple-500/50 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-purple-400" />
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