import React from 'react'
import { Link } from 'react-router-dom'
import { Globe, Eye, Zap, Shield, Users, Award } from 'lucide-react'

const Home: React.FC = () => {
  const features = [
    {
      icon: Globe,
      title: 'Cross-Language Translation',
      description: 'Translate text, speech, and images between 50+ languages with AI-powered accuracy.',
    },
    {
      icon: Eye,
      title: 'Visual Accessibility',
      description: 'Get real-time scene descriptions and object detection for enhanced visual understanding.',
    },
    {
      icon: Zap,
      title: 'Real-Time Processing',
      description: 'Instant translation and accessibility features powered by cutting-edge AI models.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data stays secure with local processing options and encrypted communications.',
    },
    {
      icon: Users,
      title: 'Multi-Platform',
      description: 'Access Vision on web, mobile, and desktop with seamless synchronization.',
    },
    {
      icon: Award,
      title: 'WCAG 2.1 AA Compliant',
      description: 'Built with accessibility in mind, meeting international accessibility standards.',
    },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Vision Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Break down language barriers and enhance accessibility with AI-powered multimodal translation 
          and visual assistance for the visually impaired.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/translator" className="btn-primary text-lg px-8 py-3">
            Start Translating
          </Link>
          <Link to="/accessibility" className="btn-secondary text-lg px-8 py-3">
            Explore Accessibility
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">
                  <Icon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-blue-50 rounded-lg">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of users who are already breaking down barriers with Vision.
        </p>
        <Link to="/translator" className="btn-primary text-lg px-8 py-3">
          Try It Now
        </Link>
      </section>
    </div>
  )
}

export default Home

