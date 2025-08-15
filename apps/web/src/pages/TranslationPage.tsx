import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LanguageIcon, 
  ArrowPathIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  ClipboardDocumentIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from '../hooks/useTranslation'
import { analyticsService } from '../services/analyticsService'
import toast from 'react-hot-toast'

export default function TranslationPage() {
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [targetLanguage, setTargetLanguage] = useState('es')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [favorites, setFavorites] = useState<Array<{ id: string; original: string; translated: string; source: string; target: string }>>([])
  const [showFavorites, setShowFavorites] = useState(false)

  const { translateText, isLoading, translationError } = useTranslation()

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      // Wait for voices to load
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices()
        setSelectedVoice(voices.find(voice => voice.lang === 'en-US') || voices[0] || null)
      }
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('translationFavorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    // Track page view
    analyticsService.trackPageView('Translation Page', {
      page_type: 'translation',
      user_role: 'user'
    })
  }, [])

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    try {
      const result = await translateText({
        text: inputText,
        sourceLanguage,
        targetLanguage
      })
      setTranslatedText(result.translatedText)
      
      // Track translation event
      analyticsService.trackTranslation(sourceLanguage, targetLanguage, {
        text_length: inputText.length,
        success: true
      })

      toast.success('Translation completed!')
    } catch (error) {
      console.error('Translation error:', error)
      
      // Track failed translation event
      analyticsService.trackTranslation(sourceLanguage, targetLanguage, {
        text_length: inputText.length,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      toast.error('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSpeak = (text: string, language: string) => {
    if (!selectedVoice || isSpeaking) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    utterance.rate = speechRate
    utterance.lang = language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : 'de-DE'
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Text copied to clipboard!')
      
      // Track copy event
      analyticsService.trackUserAction('translation_copy', {
        text_length: text.length,
        action_type: 'copy_to_clipboard'
      })
    }).catch(() => {
      toast.error('Failed to copy text')
    })
  }

  const handleAddToFavorites = () => {
    if (!inputText.trim() || !translatedText.trim()) return

    const newFavorite = {
      id: Date.now().toString(),
      original: inputText,
      translated: translatedText,
      source: sourceLanguage,
      target: targetLanguage
    }

    const updatedFavorites = [...favorites, newFavorite]
    setFavorites(updatedFavorites)
    localStorage.setItem('translationFavorites', JSON.stringify(updatedFavorites))
    
    toast.success('Added to favorites!')
    
    // Track favorite event
    analyticsService.trackUserAction('translation_favorite', {
      source_language: sourceLanguage,
      target_language: targetLanguage,
      text_length: inputText.length
    })
  }

  const handleRemoveFavorite = (id: string) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== id)
    setFavorites(updatedFavorites)
    localStorage.setItem('translationFavorites', JSON.stringify(updatedFavorites))
    toast.success('Removed from favorites!')
  }

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage)
    setTargetLanguage(sourceLanguage)
    setInputText(translatedText)
    setTranslatedText('')
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
  ]

  const getLanguageName = (code: string) => {
    return languages.find(lang => lang.code === code)?.name || code.toUpperCase()
  }

  const getLanguageFlag = (code: string) => {
    return languages.find(lang => lang.code === code)?.flag || '🌐'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🌍 AI Translation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Break down language barriers with our advanced AI-powered translation service.
            Support for 10+ languages with natural-sounding results.
          </p>
        </motion.div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Source Language */}
            <div className="flex-1 w-full lg:w-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source Language
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.flag} {language.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapLanguages}
              className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Swap languages"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>

            {/* Target Language */}
            <div className="flex-1 w-full lg:w-auto">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.flag} {language.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Translation Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <LanguageIcon className="w-5 h-5 mr-2 text-blue-600" />
                {getLanguageFlag(sourceLanguage)} {getLanguageName(sourceLanguage)}
              </h2>
              <button
                onClick={() => handleSpeak(inputText, sourceLanguage)}
                disabled={!inputText.trim() || isSpeaking}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
                title="Listen to text"
              >
                <SpeakerWaveIcon className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enter text in ${getLanguageName(sourceLanguage)}...`}
              className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  handleTranslate()
                }
              }}
            />
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {inputText.length} characters
              </span>
              <button
                onClick={() => setInputText('')}
                className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <LanguageIcon className="w-5 h-5 mr-2 text-green-600" />
                {getLanguageFlag(targetLanguage)} {getLanguageName(targetLanguage)}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSpeak(translatedText, targetLanguage)}
                  disabled={!translatedText.trim() || isSpeaking}
                  className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 disabled:opacity-50 transition-colors"
                  title="Listen to translation"
                >
                  <SpeakerWaveIcon className="w-5 h-5" />
                </button>
                {isSpeaking && (
                  <button
                    onClick={handleStopSpeaking}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    title="Stop speaking"
                  >
                    <SpeakerXMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white overflow-y-auto">
              {translatedText ? (
                <p className="whitespace-pre-wrap">{translatedText}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Translation will appear here...
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {translatedText.length} characters
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyToClipboard(translatedText)}
                  disabled={!translatedText.trim()}
                  className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
                  title="Copy to clipboard"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleAddToFavorites}
                  disabled={!inputText.trim() || !translatedText.trim()}
                  className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50 transition-colors"
                  title="Add to favorites"
                >
                  <HeartIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Speech Controls */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Speech Rate:
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                {speechRate}x
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <HeartIcon className="w-5 h-5" />
                <span>Favorites ({favorites.length})</span>
              </button>
              
              <button
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isTranslating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <LanguageIcon className="w-5 h-5" />
                    <span>Translate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {translationError && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">
                Error: {translationError.message}
              </p>
            </div>
          )}
        </motion.div>

        {/* Favorites Section */}
        {showFavorites && favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <HeartIcon className="w-5 h-5 mr-2 text-red-600" />
              Saved Translations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{getLanguageFlag(favorite.source)}</span>
                      <span>→</span>
                      <span>{getLanguageFlag(favorite.target)}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {favorite.original.substring(0, 50)}{favorite.original.length > 50 ? '...' : ''}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {favorite.translated.substring(0, 50)}{favorite.translated.length > 50 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => {
                        setInputText(favorite.original)
                        setSourceLanguage(favorite.source)
                        setTargetLanguage(favorite.target)
                        setTranslatedText(favorite.translated)
                        setShowFavorites(false)
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => handleSpeak(favorite.translated, favorite.target)}
                      className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                    >
                      Listen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Translation Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-2">Keyboard Shortcuts:</p>
              <ul className="space-y-1">
                <li>• Ctrl/Cmd + Enter: Translate</li>
                <li>• Use clear, simple sentences for better results</li>
                <li>• Check context for accurate translations</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white mb-2">Features:</p>
              <ul className="space-y-1">
                <li>• Text-to-speech in both languages</li>
                <li>• Save favorite translations</li>
                <li>• Copy translations to clipboard</li>
                <li>• Support for 10+ languages</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
