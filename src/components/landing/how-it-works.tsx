'use client'

import { Cpu, Camera, Zap, Smartphone, ArrowRight } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      title: 'Wear Visor',
      description: 'Comfortable, lightweight design with adjustable fit for all-day use',
      details: 'Ergonomic frame, breathable materials, quick-release mechanism'
    },
    {
      icon: Cpu,
      title: 'AI Detects & Analyzes',
      description: 'Real-time processing on Raspberry Pi with advanced neural networks',
      details: 'YOLOv5 detection, MediaPipe tracking, TensorFlow inference'
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Audio, visual, or haptic response tailored to your needs',
      details: 'Multi-modal output, customizable alerts, priority-based responses'
    },
    {
      icon: Smartphone,
      title: 'Stay Connected',
      description: 'Mobile app syncs everything and provides additional controls',
      details: 'Cloud backup, family sharing, remote assistance, analytics'
    }
  ]

  const techSpecs = [
    {
      category: 'Detection',
      items: ['YOLOv5 object detection', 'MediaPipe hand tracking', 'Ultrasonic sensing (3x)', '1080p camera processing']
    },
    {
      category: 'Processing',
      items: ['Raspberry Pi 4 (4GB RAM)', 'Edge AI optimization', '<500ms response time', '94-98% accuracy']
    },
    {
      category: 'Connectivity',
      items: ['WebSocket real-time streaming', 'Bluetooth 5.0', 'WiFi 802.11ac', 'Mobile app integration']
    }
  ]

  return (
    <section id="how-it-works" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Powered by AI, Designed for You
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience seamless assistance through our innovative four-step process that adapts to your unique needs
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-secondary transform -translate-x-1/2" />
            
            {/* Steps */}
            <div className="space-y-12">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                return (
                  <div key={index} className="relative flex items-center">
                    {/* Content */}
                    <div className={`ml-auto mr-auto w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:ml-auto md:pl-16'}`}>
                      <div className="p-6 rounded-2xl backdrop-blur-xl bg-background/20 border border-border/40 hover:bg-background/30 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                            <StepIcon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground mb-2">{step.description}</p>
                        <p className="text-sm text-muted-foreground/80">{step.details}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Technical Excellence</h3>
            <p className="text-muted-foreground">Cutting-edge technology optimized for real-world performance</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techSpecs.map((spec, index) => (
              <div key={index} className="p-6 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/30 hover:bg-background/20 transition-all duration-300 hover:scale-105">
                <h4 className="text-lg font-semibold text-foreground mb-4">{spec.category}</h4>
                <ul className="space-y-2">
                  {spec.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* System Architecture */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl backdrop-blur-xl bg-background/5 border border-border/20">
            <h3 className="text-xl font-semibold text-center mb-8">System Architecture</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-medium text-foreground mb-1">Input Layer</h4>
                <p className="text-xs text-muted-foreground">Sensors & Camera</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-medium text-foreground mb-1">Processing</h4>
                <p className="text-xs text-muted-foreground">AI & Edge Computing</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-medium text-foreground mb-1">Output Layer</h4>
                <p className="text-xs text-muted-foreground">Audio & Haptic</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-medium text-foreground mb-1">Control</h4>
                <p className="text-xs text-muted-foreground">Mobile App</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <a
            href="#technology"
            className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-primary-foreground rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105"
          >
            Explore Technology Stack
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
