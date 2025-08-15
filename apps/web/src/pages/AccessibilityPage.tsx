import React from 'react'
import ObjectDetector from '../components/ObjectDetector'
import VoiceCommands from '../components/VoiceCommands'
import NavigationAssistant from '../components/NavigationAssistant'
import AccessibilitySettings from '../components/AccessibilitySettings'
import OCRReader from '../components/OCRReader'

export function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ♿ Accessibility Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive accessibility tools powered by AI to enhance your digital experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ObjectDetector />
          <VoiceCommands />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <NavigationAssistant />
          <AccessibilitySettings />
        </div>

        <div className="mb-12">
          <OCRReader />
        </div>
      </div>
    </div>
  )
}