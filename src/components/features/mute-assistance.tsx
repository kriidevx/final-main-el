"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MessageSquare, Hand, Volume2, FileText } from "lucide-react";

export default function MuteAssistance() {
  const features = [
    {
      icon: MessageSquare,
      title: "Text-to-Speech",
      description: "Natural voice synthesis using ElevenLabs AI",
      color: "pink",
    },
    {
      icon: Hand,
      title: "Sign Language Recognition",
      description: "Real-time ASL detection and translation",
      color: "pink",
    },
    {
      icon: FileText,
      title: "Preset Messages",
      description: "Quick access to commonly used phrases",
      color: "pink",
    },
    {
      icon: Volume2,
      title: "Custom Voices",
      description: "Multiple voice options with adjustable speed and pitch",
      color: "pink",
    },
  ];

  return (
    <section className="py-20 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            For the <span className="text-pink-400">Speech Impaired</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Express yourself with AI-powered voice synthesis and sign language
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="glass-effect border-white/10 hover:border-pink-500/50 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-pink-400" />
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