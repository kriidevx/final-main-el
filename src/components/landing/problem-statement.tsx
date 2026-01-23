'use client'

import { Users, Eye, Ear, Mic } from 'lucide-react'

export function ProblemStatement() {
  const statistics = [
    {
      number: "285M",
      label: "visually impaired worldwide",
      icon: Eye,
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "466M", 
      label: "with hearing loss",
      icon: Ear,
      color: "from-purple-500 to-purple-600"
    },
    {
      number: "70M",
      label: "speech impaired individuals", 
      icon: Mic,
      color: "from-orange-500 to-orange-600"
    }
  ]

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Breaking Barriers, One Innovation at a Time
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Millions face daily challenges that limit their independence and quality of life. 
            Our AI-powered technology bridges these gaps, creating a world where everyone can thrive.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {statistics.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div
                key={index}
                className="group relative p-8 rounded-3xl backdrop-blur-xl bg-background/20 border border-border/40 hover:bg-background/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                
                <div className="relative z-10 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Narrative Section */}
        <div className="max-w-4xl mx-auto">
          <div className="p-12 rounded-3xl backdrop-blur-xl bg-background/10 border border-border/30">
            <h3 className="text-2xl font-semibold mb-6 text-center">The Daily Reality</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-primary">Before Vision Beyond EL</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <span>Limited navigation in unfamiliar environments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <span>Difficulty following conversations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <span>Challenges expressing needs and wants</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <span>Dependence on others for basic tasks</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-green-600">After Vision Beyond EL</h4>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Confident navigation with real-time guidance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Seamless conversation participation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Natural communication through AI assistance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Enhanced independence and confidence</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Join thousands who&apos;ve transformed their lives with our innovative technology
              </p>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-primary-foreground rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105"
              >
                Explore Solutions
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
