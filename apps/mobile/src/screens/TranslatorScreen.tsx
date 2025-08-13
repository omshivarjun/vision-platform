import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const TranslatorScreen: React.FC = () => {
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('English')
  const [targetLanguage, setTargetLanguage] = useState('Spanish')
  const [isTranslating, setIsTranslating] = useState(false)

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian',
    'Portuguese', 'Russian', 'Japanese', 'Korean', 'Chinese'
  ]

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      Alert.alert('Error', 'Please enter text to translate')
      return
    }

    setIsTranslating(true)
    try {
      // Mock translation - replace with actual API call
      const response = await fetch('/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          source_lang: sourceLanguage,
          target_lang: targetLanguage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTranslatedText(data.translated_text)
      } else {
        // Fallback mock translation
        setTranslatedText(`[Translated to ${targetLanguage}]: ${sourceText}`)
      }
    } catch (error) {
      console.error('Translation error:', error)
      setTranslatedText(`[Translation error] ${sourceText}`)
    } finally {
      setIsTranslating(false)
    }
  }

  const swapLanguages = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
    setSourceText(translatedText)
    setTranslatedText('')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="language" size={32} color="#2563eb" />
          <Text style={styles.title}>Multimodal Translator</Text>
          <Text style={styles.subtitle}>
            Translate text, speech, and images between 50+ languages
          </Text>
        </View>

        {/* Language Selection */}
        <View style={styles.languageContainer}>
          <View style={styles.languageSelector}>
            <Text style={styles.languageLabel}>From</Text>
            <View style={styles.languageDropdown}>
              <Text style={styles.languageText}>{sourceLanguage}</Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </View>
          </View>

          <TouchableOpacity onPress={swapLanguages} style={styles.swapButton}>
            <Ionicons name="swap-horizontal" size={24} color="#2563eb" />
          </TouchableOpacity>

          <View style={styles.languageSelector}>
            <Text style={styles.languageLabel}>To</Text>
            <View style={styles.languageDropdown}>
              <Text style={styles.languageText}>{targetLanguage}</Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </View>
          </View>
        </View>

        {/* Input Methods */}
        <View style={styles.inputMethods}>
          <TouchableOpacity style={styles.inputMethod}>
            <Ionicons name="mic" size={24} color="#2563eb" />
            <Text style={styles.inputMethodText}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputMethod}>
            <Ionicons name="camera" size={24} color="#2563eb" />
            <Text style={styles.inputMethodText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputMethod}>
            <Ionicons name="document" size={24} color="#2563eb" />
            <Text style={styles.inputMethodText}>File</Text>
          </TouchableOpacity>
        </View>

        {/* Translation Area */}
        <View style={styles.translationContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Source Text</Text>
            <TextInput
              style={styles.textInput}
              value={sourceText}
              onChangeText={setSourceText}
              placeholder="Enter text to translate..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.outputContainer}>
            <Text style={styles.outputLabel}>Translation</Text>
            <View style={styles.translatedTextContainer}>
              {isTranslating ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="refresh" size={24} color="#2563eb" />
                  <Text style={styles.loadingText}>Translating...</Text>
                </View>
              ) : (
                <Text style={styles.translatedText}>
                  {translatedText || 'Translation will appear here...'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.translateButton, !sourceText.trim() && styles.disabledButton]}
            onPress={handleTranslate}
            disabled={!sourceText.trim() || isTranslating}
          >
            <Text style={styles.translateButtonText}>
              {isTranslating ? 'Translating...' : 'Translate'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={[styles.secondaryButton, !translatedText && styles.disabledButton]}
              onPress={() => setTranslatedText('')}
              disabled={!translatedText}
            >
              <Text style={styles.secondaryButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, !translatedText && styles.disabledButton]}
              onPress={() => {/* Copy functionality */}}
              disabled={!translatedText}
            >
              <Ionicons name="copy" size={16} color="#374151" />
              <Text style={styles.secondaryButtonText}>Copy</Text>
            </TouchableOpacity>
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
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  languageSelector: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  languageDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  languageText: {
    fontSize: 16,
    color: '#1f2937',
  },
  swapButton: {
    padding: 12,
    marginHorizontal: 16,
  },
  inputMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  inputMethod: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputMethodText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  translationContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  outputContainer: {
    marginBottom: 20,
  },
  outputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  translatedTextContainer: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  translatedText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  actionsContainer: {
    alignItems: 'center',
  },
  translateButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  translateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 16,
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
})

export default TranslatorScreen

