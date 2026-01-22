'use client'

import { Cpu, Database, Zap, Globe, Server, Smartphone } from 'lucide-react'

export function TechnologyStack() {
  const technologies = [
    {
      name: 'Raspberry Pi 4',
      description: 'Edge computing powerhouse',
      icon: Cpu,
      color: 'from-red-500 to-red-600'
    },
    {
      name: 'TensorFlow / PyTorch',
      description: 'Advanced ML frameworks',
      icon: Database,
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'YOLOv5',
      description: 'Real-time object detection',
      icon: Zap,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'MediaPipe',
      description: 'Hand tracking & gesture recognition',
      icon: Smartphone,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Next.js',
      description: 'Modern web framework',
      icon: Globe,
      color: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Supabase',
      description: 'Real-time database & auth',
      icon: Server,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const performanceMetrics = [
    {
      metric: 'Detection Speed',
      value: '<500ms',
      description: 'Lightning-fast response time',
      color: 'text-green-500'
    },
    {
      metric: 'Accuracy',
      value: '94-98%',
      description: 'Industry-leading precision',
      color: 'text-blue-500'
    },
    {
      metric: 'Uptime',
      value: '99.9%',
      description: 'Reliable 24/7 operation',
      color: 'text-purple-500'
    },
    {
      metric: 'Battery Life',
      value: '8-10 hours',
      description: 'All-day power on single charge',
      color: 'text-orange-500'
    }
  ]

  return (
    <section id="technology" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Built on Cutting-Edge AI
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Leveraging the latest advancements in artificial intelligence and edge computing to deliver unparalleled assistive technology
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {technologies.map((tech, index) => {
            const TechIcon = tech.icon
            return (
              <div
                key={index}
                className="group relative p-6 rounded-2xl backdrop-blur-xl bg-background/20 border border-border/40 hover:bg-background/30 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tech.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="relative z-10 text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${tech.color} flex items-center justify-center`}>
                    <TechIcon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2 text-sm">
                    {tech.name}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tech.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Performance Metrics */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Performance Excellence</h3>
            <p className="text-muted-foreground">Metrics that matter for real-world usage</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/30 hover:bg-background/20 transition-all duration-300 hover:scale-105"
              >
                <div className="text-center">
                  <div className={`text-3xl md:text-4xl font-bold mb-2 ${metric.color}`}>
                    {metric.value}
                  </div>
                  <div className="font-semibold text-foreground mb-1">
                    {metric.metric}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Deep Dive */}
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl backdrop-blur-xl bg-background/5 border border-border/20">
            <h3 className="text-xl font-semibold text-center mb-8">Technical Innovation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Edge AI Processing
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    On-device AI processing ensures privacy and eliminates latency. Our optimized neural networks run efficiently on Raspberry Pi, 
                    providing real-time responses without cloud dependency.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    Multi-Modal Fusion
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Combines data from multiple sensors - camera, ultrasonic, and microphones - using advanced sensor fusion algorithms 
                    for comprehensive environmental understanding.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    Adaptive Learning
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Personalized AI that learns from user behavior and preferences, continuously improving accuracy and relevance 
                    of assistance based on individual needs.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Real-Time Streaming
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    WebSocket-based communication ensures instant data synchronization between visor, mobile app, and cloud services, 
                    providing seamless multi-device experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Partners */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-8">Trusted Technology Partners</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['Raspberry Pi', 'TensorFlow', 'Google Cloud', 'AWS', 'Microsoft'].map((partner, index) => (
              <div key={index} className="text-sm font-medium text-muted-foreground">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
