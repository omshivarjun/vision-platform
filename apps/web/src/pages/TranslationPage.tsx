import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  MicrophoneIcon, 
  CameraIcon, 
  DocumentIcon,
  SpeakerWaveIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '../hooks/useTranslation'
import { LanguageSelector } from '../components/LanguageSelector'
import { VoiceRecorder } from '../components/VoiceRecorder'
import { ImageUploader } from '../components/ImageUploader'
import { TranslationHistory } from '../components/TranslationHistory'
import { PersonalGlossary } from '../components/PersonalGlossary'
import toast from 'react-hot-toast'

export function TranslationPage() {
  const [activeTab, setActiveTab] = useState('text')
  const [sourceText, setSourceText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [targetLanguage, setTargetLanguage] = useState('es')
  const [translatedText, setTranslatedText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { translateText, isLoading } = useTranslation()

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate')
      return
    }

    setIsTranslating(true)
    try {
      const result = await translateText({
        text: sourceText,
        sourceLanguage,
        targetLanguage
      })
      setTranslatedText(result.translatedText)
      toast.success('Translation completed!')
    } catch (error) {
      toast.error('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
    setSourceText(translatedText)
    setTranslatedText('')
  }

  const handleCopyTranslation = async () => {
    if (translatedText) {
      await navigator.clipboard.writeText(translatedText)
      toast.success('Translation copied to clipboard!')
    }
  }

  const handleSpeakTranslation = () => {
    if (translatedText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translatedText)
      utterance.lang = targetLanguage
      speechSynthesis.speak(utterance)
    }
  }

  const tabs = [
    { id: 'text', label: 'Text', icon: DocumentIcon },
    { id: 'voice', label: 'Voice', icon: MicrophoneIcon },
    { id: 'image', label: 'Image', icon: CameraIcon },
    { id: 'conversation', label: 'Conversation', icon: SpeakerWaveIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🌍 Multimodal Translator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Translate text, speech, and images between 50+ languages
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Translation Area */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* Language Selection */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="form-label">From</label>
                  <LanguageSelector
                    value={sourceLanguage}
                    onChange={setSourceLanguage}
                    placeholder="Auto-detect"
                  />
                </div>
                
                <button
                  onClick={handleSwapLanguages}
                  className="mt-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Swap languages"
                >
                  <ArrowsRightLeftIcon className="w-6 h-6" />
                </button>
                
                <div className="flex-1">
                  <label className="form-label">To</label>
                  <LanguageSelector
                    value={targetLanguage}
                    onChange={setTargetLanguage}
                  />
                </div>
              </div>

              {/* Translation Content */}
              {activeTab === 'text' && (
                <div className="space-y-6">
                  <div>
                    <label className="form-label">Source Text</label>
                    <textarea
                      ref={textareaRef}
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      placeholder="Enter text to translate..."
                      className="input-field h-32 resize-none"
                      maxLength={5000}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {sourceText.length}/5000 characters
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Translation</label>
                    <div className="relative">
                      <div className="input-field h-32 bg-gray-50 dark:bg-gray-700 overflow-y-auto">
                        {isTranslating ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">Translating...</span>
                          </div>
                        ) : translatedText ? (
                          <p className="text-gray-900 dark:text-gray-100">{translatedText}</p>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">Translation will appear here...</p>
                        )}
                      </div>
                      
                      {translatedText && (
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={handleCopyTranslation}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Copy translation"
                          >
                            <ClipboardDocumentIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleSpeakTranslation}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Speak translation"
                          >
                            <SpeakerWaveIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleTranslate}
                    disabled={!sourceText.trim() || isTranslating}
                    className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTranslating ? 'Translating...' : 'Translate'}
                  </button>
                </div>
              )}

              {activeTab === 'voice' && (
                <VoiceRecorder
                  sourceLanguage={sourceLanguage}
                  targetLanguage={targetLanguage}
                  onTranslation={(result) => {
                    setSourceText(result.originalText)
                    setTranslatedText(result.translatedText)
                  }}
                />
              )}

              {activeTab === 'image' && (
                <ImageUploader
                  sourceLanguage={sourceLanguage}
                  targetLanguage={targetLanguage}
                  onTranslation={(result) => {
                    setSourceText(result.originalText)
                    setTranslatedText(result.translatedText)
                  }}
                />
              )}

              {activeTab === 'conversation' && (
                <div className="text-center py-12">
                  <SpeakerWaveIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Real-time Conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start a live conversation with real-time translation between two languages.
                  </p>
                  <button className="btn-primary">
                    Start Conversation
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TranslationHistory />
            <PersonalGlossary />
          </div>
        </div>
      </div>
    </div>
  )
}