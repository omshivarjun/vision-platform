import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const AccessibilityScreen: React.FC = () => {
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
      icon: 'camera',
      title: 'Scene Description',
      description: 'Get detailed descriptions of your surroundings',
      action: 'Analyze Scene',
      onClick: handleSceneAnalysis,
    },
    {
      icon: 'eye',
      title: 'Object Detection',
      description: 'Identify and locate objects around you',
      action: 'Detect Objects',
      onClick: () => Alert.alert('Info', 'Object detection feature coming soon'),
    },
    {
      icon: 'mic',
      title: 'Voice Commands',
      description: 'Control the app through voice commands',
      action: isListening ? 'Stop Listening' : 'Start Listening',
      onClick: () => setIsListening(!isListening),
    },
    {
      icon: 'volume-high',
      title: 'Audio Feedback',
      description: 'Receive information through clear audio',
      action: 'Test Audio',
      onClick: () => Alert.alert('Info', 'Audio test feature coming soon'),
    },
    {
      icon: 'location',
      title: 'Navigation',
      description: 'Get step-by-step navigation guidance',
      action: 'Start Navigation',
      onClick: () => Alert.alert('Info', 'Navigation feature coming soon'),
    },
    {
      icon: 'shield-checkmark',
      title: 'Safety Features',
      description: 'Obstacle detection and safety warnings',
      action: 'Enable Safety',
      onClick: () => Alert.alert('Info', 'Safety features coming soon'),
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="eye" size={32} color="#2563eb" />
          <Text style={styles.title}>Accessibility Companion</Text>
          <Text style={styles.subtitle}>
            Enhanced visual understanding and navigation assistance
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={feature.onClick}
              >
                <Ionicons name={feature.icon as any} size={32} color="#2563eb" />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
                <View style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>{feature.action}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scene Analysis Results */}
        {(sceneDescription || objects.length > 0) && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Scene Analysis Results</Text>
            
            {sceneDescription && (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Scene Description</Text>
                <Text style={styles.resultText}>{sceneDescription}</Text>
              </View>
            )}
            
            {objects.length > 0 && (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Detected Objects</Text>
                <View style={styles.objectsContainer}>
                  {objects.map((object, index) => (
                    <View key={index} style={styles.objectTag}>
                      <Text style={styles.objectText}>{object}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Accessibility Settings</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Voice Speed</Text>
            <View style={styles.settingControl}>
              <Text style={styles.settingValue}>Normal</Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>High Contrast Mode</Text>
            <View style={styles.toggleContainer}>
              <View style={styles.toggle} />
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Large Text</Text>
            <View style={styles.toggleContainer}>
              <View style={styles.toggle} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    marginBottom: 30,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  objectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  objectTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  objectText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '500',
  },
  settingsContainer: {
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
    color: '#6b7280',
  },
  toggleContainer: {
    width: 44,
    height: 24,
    backgroundColor: '#d1d5db',
    borderRadius: 12,
    padding: 2,
  },
  toggle: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
})

export default AccessibilityScreen

