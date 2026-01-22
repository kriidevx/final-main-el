'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqs = [
    {
      question: 'How accurate is the AI detection?',
      answer: 'Our AI detection achieves 94-98% accuracy in real-world conditions. The system uses advanced neural networks trained on millions of data points, continuously improving through user feedback and regular model updates.'
    },
    {
      question: 'Does it work in low light conditions?',
      answer: 'Yes, the visor is equipped with low-light capable cameras and infrared sensors. It can effectively operate in various lighting conditions, from bright daylight to dim indoor environments. Night vision mode provides enhanced visibility in dark conditions.'
    },
    {
      question: 'What languages are supported for speech features?',
      answer: 'Currently, we support English, Hindi, and 15+ Indian regional languages for speech-to-text and text-to-speech. We are continuously adding more languages based on user demand and feedback.'
    },
    {
      question: 'How long does the battery last?',
      answer: 'The standard battery provides 8-10 hours of continuous use on a single charge. Battery life varies based on usage patterns and enabled features. Fast charging provides 80% charge in 45 minutes.'
    },
    {
      question: 'Can I use it with my existing glasses?',
      answer: 'Yes, the visor is designed to be compatible with most prescription glasses. It features adjustable temples and a comfortable fit that accommodates various frame sizes and styles.'
    },
    {
      question: 'Is my data private and secure?',
      answer: 'Absolutely. All personal data is encrypted end-to-end. AI processing happens primarily on-device for privacy. Cloud features use secure servers with GDPR compliance, and you have full control over your data sharing preferences.'
    },
    {
      question: 'How do I get started?',
      answer: 'Getting started is easy: 1) Order your Vision Beyond EL kit online, 2) Download the mobile app, 3) Follow the quick setup guide (takes 5 minutes), 4) Complete the calibration process, 5) Start using your visor immediately.'
    },
    {
      question: 'What is the return policy?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not completely satisfied with your Vision Beyond EL visor, return it within 30 days for a full refund, no questions asked.'
    },
    {
      question: 'Does it require internet connection?',
      answer: 'Basic features work offline without internet. Advanced features like cloud backup, family sharing, and software updates require periodic internet connectivity. The visor can store up to 7 days of usage data offline.'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'We provide comprehensive support including 24/7 customer service, detailed video tutorials, user community forum, and one-on-one setup assistance. Pro and Enterprise plans include priority support with dedicated account managers.'
    }
  ]

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about Vision Beyond EL
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/30 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-background/20 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  {openItems.includes(index) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>
              
              {/* Answer */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openItems.includes(index) ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-6">
                  <div className="pl-14">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl backdrop-blur-xl bg-background/5 border border-border/20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">Still have questions?</h3>
              <p className="text-muted-foreground mb-8">
                Our support team is here to help you make the most of your Vision Beyond EL experience
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/30">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Email Support</h4>
                  <p className="text-sm text-muted-foreground mb-3">Get help via email</p>
                  <a href="mailto:support@visionbeyond.com" className="text-primary hover:text-primary/80 text-sm font-medium">
                    support@visionbeyond.com
                  </a>
                </div>
                
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/30">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Live Chat</h4>
                  <p className="text-sm text-muted-foreground mb-3">Chat with our team</p>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    Start Chat
                  </button>
                </div>
                
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-background/10 border border-border/30">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-3">Browse help articles</p>
                  <a href="/docs" className="text-primary hover:text-primary/80 text-sm font-medium">
                    View Docs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
