'use client'

import { useState } from 'react'
import { Eye, EyeOff, Volume2, Mic, Navigation, Camera, MessageCircle, Hand, AlertTriangle, Zap, Users } from 'lucide-react'

export function ModesShowcase() {
  const [activeMode, setActiveMode] = useState('blind')

  const modes = [
    {
      id: 'blind',
      name: 'Visually Impaired',
      icon: EyeOff,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      headline: 'See Beyond Sight',
      description: 'Navigate the world with confidence using AI-powered vision assistance',
      features: [
        {
          icon: Navigation,
          title: 'Real-time Obstacle Detection',
          description: 'Advanced sensors detect obstacles from 0.5m to 3m range with 98% accuracy'
        },
        {
          icon: Camera,
          title: 'AI Object Recognition',
          description: 'YOLO-powered identification of objects, faces, and text in real-time'
        },
        {
          icon: Volume2,
          title: 'Audio Guidance',
          description: 'Bone conduction speakers provide discreet spatial audio directions'
        },
        {
          icon: AlertTriangle,
          title: 'External LED Warnings',
          description: 'Visual alerts for safety in public spaces and emergencies'
        }
      ],
      useCase: 'Navigate busy streets, identify objects, avoid obstacles with confidence',
      demoImage: '/api/placeholder/600/400'
    },
    {
      id: 'deaf',
      name: 'Hearing Impaired', 
      icon: Volume2,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      headline: 'Hear Through Your Eyes',
      description: 'Transform visual information into accessible audio and text feedback',
      features: [
        {
          icon: MessageCircle,
          title: 'Live Speech-to-Text',
          description: 'Real-time captions with less than 500ms latency for conversations'
        },
        {
          icon: AlertTriangle,
          title: 'Environmental Sound Alerts',
          description: 'Visual notifications for doorbells, horns, sirens, and important sounds'
        },
        {
          icon: Users,
          title: 'Multi-Speaker Tracking',
          description: 'Follow and distinguish between multiple conversation participants'
        },
        {
          icon: Zap,
          title: 'Visual Vibration Patterns',
          description: 'Haptic feedback for different sound types and urgency levels'
        }
      ],
      useCase: 'Follow conversations, detect important sounds, stay connected in any environment',
      demoImage: '/api/placeholder/600/400'
    },
    {
      id: 'speech',
      name: 'Speech Impaired',
      icon: Mic,
      color: 'orange', 
      gradient: 'from-orange-500 to-orange-600',
      headline: 'Speak Without Words',
      description: 'Express yourself naturally through AI-powered communication assistance',
      features: [
        {
          icon: Hand,
          title: 'Indian Sign Language Detection',
          description: 'Recognizes 20-30 common ISL signs with 94% accuracy'
        },
        {
          icon: MessageCircle,
          title: 'Quick Phrase Buttons',
          description: 'Pre-programmed messages for Hello, Help, Emergency, and common needs'
        },
        {
          icon: Camera,
          title: 'Type-to-Speech',
          description: 'Convert typed text into natural-sounding speech instantly'
        },
        {
          icon: Navigation,
          title: 'Point & Speak',
          description: 'Point at objects and have the visor speak their names aloud'
        }
      ],
      useCase: 'Communicate naturally, express yourself, interact confidently with anyone',
      demoImage: '/api/placeholder/600/400'
    }
  ]

  const currentMode = modes.find(mode => mode.id === activeMode) || modes[0]

  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Three Modes, One Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Specialized AI assistance tailored to your unique needs, empowering independence in every aspect of life
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {modes.map((mode) => {
            const IconComponent = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`group relative px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  activeMode === mode.id
                    ? 'bg-gradient-to-r ' + mode.gradient + ' text-white shadow-lg scale-105'
                    : 'backdrop-blur-xl bg-background/20 border border-border/40 hover:bg-background/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5" />
                  {mode.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Mode Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              {/* Mode Headline */}
              <div>
                <h3 className={`text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r ${currentMode.gradient} bg-clip-text text-transparent`}>
                  {currentMode.headline}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {currentMode.description}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentMode.features.map((feature, index) => {
                  const FeatureIcon = feature.icon
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/30 hover:bg-background/20 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${currentMode.gradient} flex items-center justify-center flex-shrink-0`}>
                          <FeatureIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">
                            {feature.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Use Case */}
              <div className="p-6 rounded-2xl backdrop-blur-xl bg-background/5 border border-border/20">
                <h4 className="font-semibold text-foreground mb-2">Perfect For:</h4>
                <p className="text-muted-foreground">
                  {currentMode.useCase}
                </p>
              </div>
            </div>

            {/* Right Column - Visual Demo */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-background/20 border border-border/40">
                {/* Demo Image Placeholder */}
                <div className={`aspect-video bg-gradient-to-br ${currentMode.gradient} opacity-20 flex items-center justify-center`}>
                  <div className="text-center text-white p-8">
                    <currentMode.icon className="w-24 h-24 mx-auto mb-4 opacity-80" />
                    <p className="text-xl font-semibold mb-2">{currentMode.headline}</p>
                    <p className="text-sm opacity-80">Interactive Demo Coming Soon</p>
                  </div>
                </div>
                
                {/* Overlay Stats */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-4">
                  <div className="px-3 py-2 rounded-xl backdrop-blur-xl bg-background/80 border border-border/40">
                    <span className="text-xs font-medium">Accuracy</span>
                    <span className="text-sm font-bold text-green-500">94-98%</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl backdrop-blur-xl bg-background/80 border border-border/40">
                    <span className="text-xs font-medium">Latency</span>
                    <span className="text-sm font-bold text-blue-500">&lt;500ms</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse opacity-60" />
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-accent to-secondary rounded-full animate-pulse animation-delay-1000 opacity-60" />
            </div>
          </div>
        </div>

        {/* Mode Navigation */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Explore each mode to see how Vision Beyond EL transforms lives
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeMode === mode.id
                    ? 'bg-gradient-to-r ' + mode.gradient + ' text-white'
                    : 'backdrop-blur-xl bg-background/10 border border-border/30 hover:bg-background/20 text-muted-foreground hover:text-foreground'
                }`}
              >
                Try {mode.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
