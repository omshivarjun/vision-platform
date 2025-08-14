import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon, 
  MicrophoneIcon, 
  CameraIcon,
  SpeakerWaveIcon,
  MapIcon,
  CogIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { SceneAnalyzer } from '../components/SceneAnalyzer'
import { ObjectDetector } from '../components/ObjectDetector'
import { VoiceCommands } from '../components/VoiceCommands'
import { NavigationAssistant } from '../components/NavigationAssistant'
import { AccessibilitySettings } from '../components/AccessibilitySettings'
import { OCRReader } from '../components/OCRReader'

export function AccessibilityPage() {
  const [activeFeature, setActiveFeature] = useState('scene')

  const features = [
    {
      id: 'scene',
      title: 'Scene Description',
      description: 'Get detailed descriptions of your surroundings',
      icon: EyeIcon,
      component: SceneAnalyzer,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'objects',
      title: 'Object Detection',
      description: 'Identify and locate objects around you',
      icon: CameraIcon,
      component: ObjectDetector,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'voice',
      title: 'Voice Commands',
      description: 'Control the app through voice commands',
      icon: MicrophoneIcon,
      component: VoiceCommands,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'ocr',
      title: 'Text Reader',
      description: 'Read printed and handwritten text aloud',
      icon: SpeakerWaveIcon,
      component: OCRReader,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'navigation',
      title: 'Navigation',
      description: 'Step-by-step voice navigation guidance',
      icon: MapIcon,
      component: NavigationAssistant,
      color: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Customize accessibility preferences',
      icon: CogIcon,
      component: AccessibilitySettings,
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const activeFeatureData = features.find(f => f.id === activeFeature)
  const ActiveComponent = activeFeatureData?.component

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ♿ Accessibility Companion
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Enhanced visual understanding and navigation assistance
          </p>
        </div>

        {/* Safety Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Safety First
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                This app provides assistance but should not replace personal judgment, guide dogs, 
                or other mobility aids. Always prioritize your safety and use multiple sources of information.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Feature Navigation */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Features
              </h2>
              <nav className="space-y-2">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeFeature === feature.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{feature.title}</div>
                      <div className="text-sm opacity-75">{feature.description}</div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full btn-outline text-sm py-2">
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Emergency Mode
                </button>
                <button className="w-full btn-outline text-sm py-2">
                  <MicrophoneIcon className="w-4 h-4 mr-2" />
                  Voice Help
                </button>
                <button className="w-full btn-outline text-sm py-2">
                  <CogIcon className="w-4 h-4 mr-2" />
                  Quick Settings
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${activeFeatureData?.color} flex items-center justify-center`}>
                  {activeFeatureData?.icon && <activeFeatureData.icon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeFeatureData?.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeFeatureData?.description}
                  </p>
                </div>
              </div>

              {ActiveComponent && <ActiveComponent />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}