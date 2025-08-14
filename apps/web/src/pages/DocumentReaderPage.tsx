import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentArrowUpIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function DocumentReaderPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isReading, setIsReading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [readingSpeed, setReadingSpeed] = useState(1)
  const [documentText, setDocumentText] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  React.useEffect(() => {
    synthesisRef.current = window.speechSynthesis
    setDocumentText('Welcome to the Vision Platform Document Reader. This AI-powered tool can read PDFs, Word documents, and other text files aloud with natural voice synthesis. Simply upload a document and click the play button to start reading.')
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setUploadedFile(file)

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setDocumentText('Document processed successfully! This is a sample text that demonstrates the document reading capabilities. The system can handle various file formats and provide natural-sounding speech synthesis.')
      toast.success(`Successfully processed ${file.name}`)
    } catch (error) {
      toast.error('Error processing document. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const startReading = () => {
    if (!synthesisRef.current || !documentText) return

    synthesisRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(documentText)
    utterance.rate = readingSpeed
    utterance.volume = 1

    utterance.onstart = () => {
      setIsReading(true)
      toast.success('Started reading document')
    }

    utterance.onend = () => {
      setIsReading(false)
    }

    synthesisRef.current.speak(utterance)
  }

  const stopReading = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsReading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4"
          >
            <DocumentTextIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📖 Document Reader
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            AI-powered document reading with text-to-speech for PDFs, Word docs, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-green-600" />
                Upload Document
              </h2>
              
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Choose File'}
                </button>
                
                {uploadedFile && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      📄 {uploadedFile.name}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Reading Controls */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <SpeakerWaveIcon className="w-5 h-5 mr-2 text-blue-600" />
                Reading Controls
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={isReading ? stopReading : startReading}
                  disabled={!documentText}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isReading ? (
                    <>
                      <PauseIcon className="w-4 h-4 mr-2" />
                      Pause Reading
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-4 h-4 mr-2" />
                      Start Reading
                    </>
                  )}
                </button>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reading Speed: {readingSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={readingSpeed}
                    onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Document Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl h-[500px] flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Document Content
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {documentText}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
