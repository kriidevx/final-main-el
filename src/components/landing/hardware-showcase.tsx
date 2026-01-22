'use client'

import { Camera, Cpu, Zap, Battery, Bluetooth, Package } from 'lucide-react'

export function HardwareShowcase() {
  const specifications = [
    {
      category: 'Sensors & Camera',
      items: [
        { name: 'Pi Camera Module', spec: '1080p @ 30fps', icon: Camera },
        { name: 'Ultrasonic Sensors', spec: '3x HC-SR04 (0.5m-3m range)', icon: Zap },
        { name: 'LED Strip', spec: 'WS2812B (60 LEDs/meter)', icon: Zap }
      ]
    },
    {
      category: 'Processing & Power',
      items: [
        { name: 'Processor', spec: 'Raspberry Pi 4 (4GB RAM)', icon: Cpu },
        { name: 'Battery', spec: '5000mAh (8-10 hours)', icon: Battery },
        { name: 'Connectivity', spec: 'Bluetooth 5.0 + WiFi', icon: Bluetooth }
      ]
    }
  ]

  const features = [
    'Lightweight ergonomic design (280g)',
    'Adjustable head strap for all head sizes',
    'IP54 water and dust resistance',
    'Quick-release magnetic charging',
    'Modular sensor upgrade system',
    'Voice-activated controls'
  ]

  const comparison = [
    {
      feature: 'Real-time AI Processing',
      visionBeyond: true,
      traditional: false
    },
    {
      feature: 'Multi-Modal Assistance',
      visionBeyond: true,
      traditional: false
    },
    {
      feature: 'Edge Computing',
      visionBeyond: true,
      traditional: false
    },
    {
      feature: 'Mobile App Integration',
      visionBeyond: true,
      traditional: false
    },
    {
      feature: 'Battery Life >8 hours',
      visionBeyond: true,
      traditional: false
    },
    {
      feature: 'Accuracy >90%',
      visionBeyond: true,
      traditional: false
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            The Vision Beyond EL Visor
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Cutting-edge hardware designed for comfort, performance, and reliability in real-world conditions
          </p>
        </div>

        {/* Product Showcase */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden backdrop-blur-xl bg-background/20 border border-border/40">
                <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Package className="w-32 h-32 mx-auto mb-6 text-primary" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">Vision Beyond EL Visor</h3>
                    <p className="text-muted-foreground mb-4">Revolutionary Assistive Technology</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Camera className="w-4 h-4" />
                      360° View Available
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badges */}
              <div className="absolute -top-4 -right-4 px-3 py-1 rounded-full bg-green-500 text-white text-sm font-semibold">
                New
              </div>
              <div className="absolute -bottom-4 -left-4 px-3 py-1 rounded-full bg-blue-500 text-white text-sm font-semibold">
                Award 2026
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl backdrop-blur-xl bg-background/10 border border-border/30"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold mb-4">Technical Specifications</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specifications.map((category, index) => (
              <div key={index} className="p-6 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/30">
                <h4 className="text-lg font-semibold text-foreground mb-4">{category.category}</h4>
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => {
                    const ItemIcon = item.icon
                    return (
                      <div key={itemIndex} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                          <ItemIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.spec}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold mb-4">Why Vision Beyond EL?</h3>
            <p className="text-muted-foreground">See how we compare to traditional assistive devices</p>
          </div>
          
          <div className="overflow-hidden rounded-2xl backdrop-blur-xl bg-background/10 border border-border/30">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center p-4 font-semibold text-primary">Vision Beyond EL</th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Traditional Devices</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, index) => (
                  <tr key={index} className="border-b border-border/10">
                    <td className="p-4 text-foreground">{item.feature}</td>
                    <td className="p-4 text-center">
                      {item.visionBeyond ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.traditional ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 font-semibold text-primary-foreground rounded-2xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105"
          >
            View Pricing & Availability
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
