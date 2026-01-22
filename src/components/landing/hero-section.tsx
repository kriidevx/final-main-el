'use client'

import { useState } from 'react'
import { Play, ArrowRight, Eye, EyeOff, Volume2, Mic } from 'lucide-react'

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <section className="min-h-screen flex items-center justify-center relative pt-16">
      <div className="container mx-auto px-4 text-center">
        {/* Glassmorphism Hero Card */}
        <div className="max-w-4xl mx-auto p-12 rounded-3xl backdrop-blur-xl bg-background/20 border border-border/40 shadow-2xl">
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Empowering Independence
            <br />
            Through AI Vision
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Revolutionary assistive technology for visually impaired, deaf, and speech-impaired communities
          </p>

          {/* 3D Visual Representation */}
          <div className="relative mb-12 h-64 flex items-center justify-center">
            {/* Animated Visor/Glasses Representation */}
            <div className="relative animate-float">
              <div className="w-48 h-32 border-4 border-gradient-to-r from-primary via-accent to-secondary rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-md">
                {/* Camera Lens */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse">
                  <div className="w-full h-full rounded-full border-4 border-white/30 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                {/* LED Strip */}
                <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-full animate-pulse" />
              </div>
              
              {/* Particle Effects */}
              <div className="absolute -top-4 -left-4 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
              <div className="absolute -top-2 -right-6 w-2 h-2 bg-purple-400 rounded-full animate-ping animation-delay-1000" />
              <div className="absolute -bottom-4 left-8 w-2 h-2 bg-orange-400 rounded-full animate-ping animation-delay-2000" />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/dashboard"
              className="group relative px-8 py-4 text-lg font-semibold text-primary-foreground rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="group px-8 py-4 text-lg font-semibold text-foreground border-2 border-border/40 rounded-2xl backdrop-blur-xl bg-background/10 hover:bg-background/20 transition-all duration-300 hover:scale-105 hover:border-primary/50"
            >
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-col sm:flex-row gap-8 justify-center items-center">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">98%</div>
              <div className="text-sm text-muted-foreground">AI Accuracy</div>
            </div>
          </div>
        </div>

        {/* Mode Icons */}
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/20">
            <EyeOff className="w-8 h-8 text-blue-500" />
            <span className="text-sm font-medium">Blind Assistance</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/20">
            <Volume2 className="w-8 h-8 text-purple-500" />
            <span className="text-sm font-medium">Deaf Assistance</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/20">
            <Mic className="w-8 h-8 text-orange-500" />
            <span className="text-sm font-medium">Speech Assistance</span>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-3xl backdrop-blur-xl bg-background/90 border border-border/40 p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-background/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-xl font-semibold">Demo Video Coming Soon</p>
                <p className="text-muted-foreground">Experience the future of assistive technology</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
