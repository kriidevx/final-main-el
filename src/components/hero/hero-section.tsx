"use client";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import FloatingLines from "./FloatingLines";
import { Eye, Ear, MessageSquare, Zap } from "lucide-react";
import Link from "next/link";
import FuturisticVisor from "./futuristic-visor";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Floating Lines Background */}
      <div className="absolute inset-0 z-0">
        <FloatingLines
          linesGradient={['#3b82f6', '#60a5fa', '#93c5fd']} // More subtle blue gradient
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[6, 10, 12]} // Reduced line count
          lineDistance={[12, 10, 8]} // Increased distance between lines
          bendRadius={2.0}
          bendStrength={-0.2}
          interactive={false}
          parallax={false}
          mixBlendMode="soft-light"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge className="bg-blue-400/10 text-blue-300 border-blue-400/20 px-4 py-2 backdrop-blur-sm">
              <Eye className="w-4 h-4 mr-2" />
              AI Vision
            </Badge>
            <Badge className="bg-purple-400/10 text-purple-300 border-purple-400/20 px-4 py-2 backdrop-blur-sm">
              <Ear className="w-4 h-4 mr-2" />
              Smart Alerts
            </Badge>
            <Badge className="bg-pink-400/10 text-pink-300 border-pink-400/20 px-4 py-2 backdrop-blur-sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Voice Synthesis
            </Badge>
            <Badge className="bg-cyan-400/10 text-cyan-300 border-cyan-400/20 px-4 py-2 backdrop-blur-sm">
              <Zap className="w-4 h-4 mr-2" />
              Real-time Detection
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Vision <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">Beyond</span>
            <br />
            <span className="text-3xl md:text-5xl text-slate-300">
              Empowering Through Technology
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto">
            AI-powered assistive platform providing real-time object detection, 
            sign language recognition, and text-to-speech for enhanced accessibility.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1">
                Get Started Free
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 transition-all duration-300 transform hover:-translate-y-1">
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Futuristic Visor */}
          <div className="mt-16 flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80">
              <FuturisticVisor />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/10">
            <div className="space-y-2 glass-effect p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-4xl font-bold text-blue-400">99.5%</div>
              <div className="text-sm text-slate-400">Detection Accuracy</div>
            </div>
            <div className="space-y-2 glass-effect p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-4xl font-bold text-purple-400">50ms</div>
              <div className="text-sm text-slate-400">Response Time</div>
            </div>
            <div className="space-y-2 glass-effect p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-4xl font-bold text-pink-400">24/7</div>
              <div className="text-sm text-slate-400">Availability</div>
            </div>
            <div className="space-y-2 glass-effect p-4 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-4xl font-bold text-cyan-400">100+</div>
              <div className="text-sm text-slate-400">Objects Detected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
    </section>
  );
}