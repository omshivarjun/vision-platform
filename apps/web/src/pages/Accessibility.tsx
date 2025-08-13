import React, { useState } from 'react'
import { Eye, Camera, Mic, Volume2, MapPin, Shield } from 'lucide-react'

const Accessibility: React.FC = () => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sceneDescription, setSceneDescription] = useState('')
  const [objects, setObjects] = useState<string[]>([])

  const handleSceneAnalysis = async () => {
    setIsProcessing(true)
    try {
      // Mock scene analysis - replace with actual API call
      const response = await fetch('/ai/analyze-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'mock-image-data' }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setSceneDescription(data.description)
        setObjects(data.objects)
      } else {
        // Fallback mock data
        setSceneDescription('A modern office environment with a desk, computer, and various office supplies.')
        setObjects(['desk', 'computer', 'chair', 'lamp', 'notebook', 'pen'])
      }
    } catch (error) {
      console.error('Scene analysis error:', error)
      setSceneDescription('Unable to analyze scene. Please try again.')
      setObjects([])
    } finally {
      setIsProcessing(false)
    }
  }

  const features = [
    {
      icon: Camera,
      title: 'Scene Description',
      description: 'Get detailed descriptions of your surroundings in real-time.',
      action: 'Analyze Scene',
      onClick: handleSceneAnalysis,
    },
    {
      icon: Eye,
      title: 'Object Detection',
      description: 'Identify and locate objects around you with high accuracy.',
      action: 'Detect Objects',
      onClick: () => {/* Object detection logic */},
    },
    {
      icon: Mic,
      title: 'Voice Commands',
      description: 'Control the app and get information through voice commands.',
      action: isListening ? 'Stop Listening' : 'Start Listening',
      onClick: () => setIsListening(!isListening),
    },
    {
      icon: Volume2,
      title: 'Audio Feedback',
      description: 'Receive information through clear, customizable audio.',
      action: 'Test Audio',
      onClick: () => {/* Audio test logic */},
    },
    {
      icon: MapPin,
      title: 'Navigation Assistance',
      description: 'Get step-by-step navigation guidance with safety alerts.',
      action: 'Start Navigation',
      onClick: () => {/* Navigation logic */},
    },
    {
      icon: Shield,
      title: 'Safety Features',
      description: 'Obstacle detection and safety boundary warnings.',
      action: 'Enable Safety',
      onClick: () => {/* Safety features logic */},
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Accessibility Companion
        </h1>
        <p className="text-lg text-gray-600">
          Enhanced visual understanding and navigation assistance for the visually impaired
        </p>
      </div>

      {/* Main Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center mb-4">
                <Icon className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <button
                onClick={feature.onClick}
                className="w-full btn-primary"
              >
                {feature.action}
              </button>
            </div>
          )
        })}
      </div>

      {/* Scene Analysis Results */}
      {(sceneDescription || objects.length > 0) && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Scene Analysis Results
          </h3>
          
          {sceneDescription && (
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                Scene Description
              </h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {sceneDescription}
              </p>
            </div>
          )}
          
          {objects.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                Detected Objects
              </h4>
              <div className="flex flex-wrap gap-2">
                {objects.map((object, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {object}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accessibility Settings */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Accessibility Settings
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Speed
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Slow</option>
              <option>Normal</option>
              <option>Fast</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio Volume
            </label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="80"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              High Contrast Mode
            </label>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Large Text
            </label>
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Accessibility

