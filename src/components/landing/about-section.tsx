'use client'

import { Github, Mail, MapPin, Code, Smartphone, Globe, Users, Cpu, Mic, Volume2 } from 'lucide-react'

export function AboutSection() {
  const teamMembers = [
    {
      name: 'KRUTHI',
      role: 'Website + Mobile App Development',
      responsibilities: [
        { icon: Smartphone, title: 'Mobile App', desc: 'React Native / Flutter' },
        { icon: Code, title: 'Design 3 mode interfaces', desc: 'Blind/Deaf/Mute' },
        { icon: Globe, title: 'Real-time data display', desc: 'From Raspberry Pi' },
        { icon: Users, title: 'Bluetooth/WiFi connectivity', desc: 'Seamless connection' },
        { icon: Volume2, title: 'TTS integration', desc: 'pyttsx3/gTTS' },
        { icon: Mic, title: 'STT integration', desc: 'Google Speech API' }
      ],
      techStack: ['React Native', 'Firebase', 'Socket.IO'],
      deliverables: ['App UI mockups (Figma)', 'Working app with 3 modes', 'Website deployment']
    },
    {
      name: 'TANUSHREE',
      role: 'Obstacle Detection System',
      responsibilities: [
        { icon: Cpu, title: 'Ultrasonic Sensor Integration', desc: 'HC-SR04 x3' },
        { icon: Code, title: 'Python script', desc: 'Distance measurement' },
        { icon: Globe, title: 'Real-time data streaming', desc: 'To mobile app' },
        { icon: Volume2, title: 'Audio Alert System', desc: 'Text-to-Speech' },
        { icon: MapPin, title: 'Distance-based voice alerts', desc: 'Direction guidance' }
      ],
      techStack: ['Python (RPi.GPIO)', 'pyttsx3', 'Threading'],
      deliverables: ['Working obstacle detection code', 'Audio alert system', 'Calibration system']
    },
    {
      name: 'UMEKA',
      role: 'Indian Sign Language (ISL) Detection',
      responsibilities: [
        { icon: Users, title: 'ISL Gesture Recognition', desc: '20-30 signs' },
        { icon: Code, title: 'MediaPipe Hands', desc: 'Implementation' },
        { icon: Smartphone, title: 'Camera Integration', desc: 'Raspberry Pi setup' },
        { icon: Cpu, title: 'Low-latency detection', desc: '<500ms' }
      ],
      techStack: ['Python + OpenCV', 'TensorFlow Lite', 'MediaPipe Hands'],
      deliverables: ['Trained ISL model', 'Real-time detection script', 'Accuracy report']
    },
    {
      name: 'DEEPANA',
      role: 'Text-to-Speech (TTS) Model & Prototype Assembly',
      responsibilities: [
        { icon: Volume2, title: 'TTS System', desc: 'Voice Output Module' },
        { icon: Code, title: 'pyttsx3/gTTS', desc: 'Integration' },
        { icon: Users, title: 'Voice customization', desc: 'Male/female, speed' },
        { icon: Globe, title: 'Multi-language support', desc: 'English, Hindi, Kannada' },
        { icon: Smartphone, title: 'Hardware Prototype', desc: 'Visor Construction' }
      ],
      techStack: ['Python (TTS libraries)', 'Hardware assembly tools'],
      deliverables: ['Working TTS system (3 languages)', 'Assembled visor prototype v1']
    },
    {
      name: 'ANVITHA',
      role: 'Google Maps API + Spatial Navigation + Prototype Assembly',
      responsibilities: [
        { icon: MapPin, title: 'Navigation & Mapping', desc: 'Google Maps Integration' },
        { icon: Volume2, title: 'GPS-based navigation', desc: 'For blind users' },
        { icon: Users, title: 'Turn-by-turn audio', desc: 'Directions' },
        { icon: Globe, title: 'POI detection', desc: '"Where am I?" feature' },
        { icon: Smartphone, title: 'Spatial Audio Mapping', desc: '3D audio cues' }
      ],
      techStack: ['Google Maps API', 'Geolocation services', 'Python + GPS module'],
      deliverables: ['Maps integration in app', 'Voice navigation system', 'Assembled visor prototype v1']
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Meet Our Team
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The brilliant minds behind Vision Beyond EL, working together to create innovative assistive technology
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="space-y-16">
          {teamMembers.map((member, index) => (
            <div key={index} className="p-8 rounded-3xl backdrop-blur-xl bg-background/10 border border-border/30">
              {/* Member Header */}
              <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{member.name.charAt(0)}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{member.name}</h3>
                  <p className="text-lg text-primary font-medium mb-4">{member.role}</p>
                  
                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.techStack.map((tech, techIndex) => (
                      <span key={techIndex} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Responsibilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {member.responsibilities.map((resp, respIndex) => {
                  const RespIcon = resp.icon
                  return (
                    <div key={respIndex} className="p-4 rounded-2xl backdrop-blur-xl bg-background/5 border border-border/20 hover:bg-background/10 transition-all duration-300 hover:scale-105">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                          <RespIcon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-semibold text-foreground">{resp.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{resp.desc}</p>
                    </div>
                  )
                })}
              </div>

              {/* Deliverables */}
              <div className="p-6 rounded-2xl backdrop-blur-xl bg-accent/5 border border-accent/20">
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-accent" />
                  Deliverables
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {member.deliverables.map((deliverable, delIndex) => (
                    <div key={delIndex} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-muted-foreground">{deliverable}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center p-8 rounded-3xl backdrop-blur-xl bg-background/10 border border-border/30">
          <h3 className="text-2xl font-bold text-foreground mb-6">Get In Touch</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Have questions about our technology or want to collaborate? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:team@visionbeyond.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium hover:scale-105 transition-all duration-300"
            >
              <Mail className="w-5 h-5" />
              Email Team
            </a>
            <a
              href="https://github.com/visionbeyond"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-background/20 border border-border/40 hover:bg-background/30 font-medium hover:scale-105 transition-all duration-300"
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
