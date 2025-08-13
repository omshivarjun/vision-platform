import React, { useState } from 'react'
import { Globe, Mic, Camera, FileText, Download, Share2 } from 'lucide-react'

const Translator: React.FC = () => {
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [targetLanguage, setTargetLanguage] = useState('es')
  const [isTranslating, setIsTranslating] = useState(false)

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
  ]

  const handleTranslate = async () => {
    if (!sourceText.trim()) return
    
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
        setTranslatedText(`[Translated to ${languages.find(l => l.code === targetLanguage)?.name}]: ${sourceText}`)
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Multimodal Translator
        </h1>
        <p className="text-lg text-gray-600">
          Translate text, speech, and images between 50+ languages
        </p>
      </div>

      {/* Language Selection */}
      <div className="flex items-center justify-center space-x-4">
        <select
          value={sourceLanguage}
          onChange={(e) => setSourceLanguage(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        <button
          onClick={swapLanguages}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Swap languages"
        >
          <Globe className="h-5 w-5" />
        </button>

        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Input Methods */}
      <div className="grid md:grid-cols-3 gap-4">
        <button className="card hover:shadow-lg transition-shadow cursor-pointer text-center">
          <Mic className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <span className="font-medium">Voice Input</span>
        </button>
        <button className="card hover:shadow-lg transition-shadow cursor-pointer text-center">
          <Camera className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <span className="font-medium">Image Upload</span>
        </button>
        <button className="card hover:shadow-lg transition-shadow cursor-pointer text-center">
          <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <span className="font-medium">File Upload</span>
        </button>
      </div>

      {/* Translation Area */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Source Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Text
          </label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter text to translate..."
            className="w-full h-48 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Translated Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Translation
          </label>
          <div className="w-full h-48 border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 overflow-y-auto">
            {isTranslating ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <p className="text-gray-700">{translatedText || 'Translation will appear here...'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || isTranslating}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTranslating ? 'Translating...' : 'Translate'}
        </button>
        <button
          onClick={() => setTranslatedText('')}
          disabled={!translatedText}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(translatedText)}
          disabled={!translatedText}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4 mr-2" />
          Copy
        </button>
        <button
          onClick={() => {/* Share functionality */}}
          disabled={!translatedText}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </button>
      </div>
    </div>
  )
}

export default Translator

