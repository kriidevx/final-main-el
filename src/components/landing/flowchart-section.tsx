'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle, Camera, Cpu, Zap, Smartphone } from 'lucide-react'

export function FlowchartSection() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      id: 0,
      title: 'Wear Visor',
      description: 'Comfortable, lightweight design with adjustable fit for all-day use',
      icon: Camera,
      color: 'from-blue-500 to-blue-600',
      details: ['Ergonomic frame', 'Breathable materials', 'Quick-release mechanism']
    },
    {
      id: 1,
      title: 'AI Detects & Analyzes',
      description: 'Real-time processing on Raspberry Pi with advanced neural networks',
      icon: Cpu,
      color: 'from-purple-500 to-purple-600',
      details: ['YOLOv5 detection', 'MediaPipe tracking', 'TensorFlow inference']
    },
    {
      id: 2,
      title: 'Instant Feedback',
      description: 'Audio, visual, or haptic response tailored to your needs',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      details: ['Multi-modal output', 'Customizable alerts', 'Priority-based responses']
    },
    {
      id: 3,
      title: 'Stay Connected',
      description: 'Mobile app syncs everything and provides additional controls',
      icon: Smartphone,
      color: 'from-green-500 to-green-600',
      details: ['Cloud backup', 'Family sharing', 'Remote assistance', 'Analytics']
    }
  ]

  return (
    <section className="py-16 relative">
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

        {/* Flowchart */}
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Desktop Flow */}
            <div className="hidden lg:block">
              {/* Connection Lines */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary transform -translate-y-1/2 z-0" />
              
              {/* Steps Grid */}
              <div className="grid grid-cols-4 gap-8 relative z-10">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = activeStep === step.id
                  
                  return (
                    <div
                      key={step.id}
                      className="relative group"
                      onMouseEnter={() => setActiveStep(step.id)}
                      onMouseLeave={() => setActiveStep(-1)}
                    >
                      {/* Step Card */}
                      <div className={`relative p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? 'bg-gradient-to-br ' + step.color + ' bg-opacity-20 border-primary/50 shadow-2xl'
                          : 'bg-background/20 border-border/40 hover:bg-background/30 hover:border-primary/30'
                      }`}>
                        {/* Number Badge */}
                        <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r ' + step.color + ' text-white shadow-lg'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>

                        {/* Icon */}
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                          <StepIcon className="w-10 h-10 text-white" />
                        </div>

                        {/* Content */}
                        <div className="text-center">
                          <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground mb-6 leading-relaxed">
                            {step.description}
                          </p>
                          
                          {/* Details List */}
                          <ul className="space-y-2 text-left">
                            {step.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Hover Effect */}
                        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      </div>

                      {/* Arrow to Next Step */}
                      {index < steps.length - 1 && (
                        <div className="absolute top-1/2 -translate-y-1/2 left-full w-12">
                          <div className={`w-full h-1 bg-gradient-to-r ${step.color} transition-all duration-300 group-hover:scale-x-110`}>
                            <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mobile/Tablet Flow */}
            <div className="lg:hidden">
              <div className="space-y-8">
                {steps.map((step, index) => {
                  const StepIcon = step.icon
                  const isActive = activeStep === step.id
                  
                  return (
                    <div
                      key={step.id}
                      className="relative group"
                      onMouseEnter={() => setActiveStep(step.id)}
                      onMouseLeave={() => setActiveStep(-1)}
                    >
                      <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br ' + step.color + ' bg-opacity-20 border-primary/50'
                          : 'bg-background/20 border-border/40 hover:bg-background/30'
                      }`}>
                        <div className="flex items-start gap-4">
                          {/* Step Number */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 flex-shrink-0 ${
                            isActive
                              ? 'bg-gradient-to-r ' + step.color + ' text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                                <StepIcon className="w-6 h-6 text-white" />
                              </div>
                              <h3 className={`text-lg font-bold transition-colors duration-300 ${
                                isActive ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {step.title}
                              </h3>
                            </div>
                            
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                              {step.description}
                            </p>
                            
                            <ul className="space-y-2">
                              {step.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Arrow for Mobile */}
                        {index < steps.length - 1 && (
                          <div className="absolute bottom-4 right-4">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                              <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
