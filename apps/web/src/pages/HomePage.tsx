import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  LanguageIcon, 
  EyeIcon, 
  MicrophoneIcon, 
  CameraIcon,
  SpeakerWaveIcon,
  MapIcon 
} from '@heroicons/react/24/outline'

export function HomePage() {
  const features = [
    {
      icon: LanguageIcon,
      title: 'Cross-Language Translation',
      description: 'Translate text, speech, and images between 50+ languages with AI-powered accuracy.',
      href: '/translation',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: EyeIcon,
      title: 'Visual Accessibility',
      description: 'Scene descriptions, object detection, and navigation assistance for visually impaired users.',
      href: '/accessibility',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: MicrophoneIcon,
      title: 'Voice Control',
      description: 'Complete voice-first experience with natural language commands and audio feedback.',
      href: '/accessibility',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: CameraIcon,
      title: 'Real-time OCR',
      description: 'Extract and translate text from images, documents, and live camera feed.',
      href: '/translation',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: SpeakerWaveIcon,
      title: 'Text-to-Speech',
      description: 'Natural voice synthesis in multiple languages with customizable settings.',
      href: '/accessibility',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: MapIcon,
      title: 'Navigation Assistance',
      description: 'Step-by-step voice navigation with obstacle detection and safety warnings.',
      href: '/accessibility',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Vision Platform
              </span>
              <br />
              <span className="text-2xl md:text-4xl font-semibold text-gray-700 dark:text-gray-300">
                Multimodal Translation & Accessibility
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
            >
              Break down language barriers and enhance accessibility with AI-powered translation, 
              speech recognition, and scene description technology.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/translation" className="btn-primary text-lg px-8 py-3">
                Start Translating
              </Link>
              <Link to="/accessibility" className="btn-outline text-lg px-8 py-3">
                Accessibility Features
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="main-content" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Everyone
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with accessibility-first design 
              to create an inclusive experience for all users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link to={feature.href} className="block h-full">
                  <div className="card h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 font-medium">
                      Learn more
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">Languages Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">WCAG 2.1</div>
              <div className="text-gray-600 dark:text-gray-400">AA Compliant</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">AI Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already breaking down language barriers 
            and enhancing accessibility with Vision Platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
            <Link 
              to="/api-docs" 
              className="border border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              View API Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}