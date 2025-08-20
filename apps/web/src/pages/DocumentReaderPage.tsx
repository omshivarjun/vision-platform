import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  DocumentIcon, 
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline'
import { documentService, DocumentParseResult, DocumentUploadProgress } from '../services/documentService'
import { documentApi } from '../services/realApi'
import toast from 'react-hot-toast'

export default function DocumentReaderPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processedDocuments, setProcessedDocuments] = useState<DocumentParseResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<DocumentParseResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speechRate, setSpeechRate] = useState(1)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const speechRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechRef.current = window.speechSynthesis
      // Wait for voices to load
      speechRef.current.onvoiceschanged = () => {
        const voices = speechRef.current?.getVoices() || []
        setSelectedVoice(voices.find(voice => voice.lang === 'en-US') || voices[0] || null)
      }
    }
  }, [])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const isValid = documentService.validateFileSize(file, 10)
      if (!isValid) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`)
      }
      return isValid
    })

    if (validFiles.length === 0) return

    setUploadedFiles(prev => [...prev, ...validFiles])
    
    // Initialize progress tracking
    const progressItems: DocumentUploadProgress[] = validFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading',
      message: 'Starting upload...'
    }))
    setUploadProgress(prev => [...prev, ...progressItems])

    // Process each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const progressIndex = progressItems.findIndex(item => item.fileName === file.name)
      
      try {
        // Update progress
        setUploadProgress(prev => prev.map((item, idx) => 
          item.fileName === file.name 
            ? { ...item, status: 'processing', message: 'Processing document...', progress: 50 }
            : item
        ))

        // Create server entry and request extraction (non-blocking for now)
        try {
          await documentApi.uploadDocument(file, { language: 'en', extractText: true, extractStructure: true })
        } catch (e) {
          // Non-fatal; proceed with local processing as fallback
        }

        // Process document locally (fallback/demo)
        const result = await documentService.processDocument(file)
        
        // Update progress
        setUploadProgress(prev => prev.map((item, idx) => 
          item.fileName === file.name 
            ? { ...item, status: 'completed', message: 'Processing complete!', progress: 100 }
            : item
        ))

        // Add to processed documents
        setProcessedDocuments(prev => [...prev, result])
        
        // Set as current document if it's the first one
        if (processedDocuments.length === 0) {
          setCurrentDocument(result)
        }

        toast.success(`${file.name} processed successfully!`)
      } catch (error) {
        console.error('Error processing file:', error)
        setUploadProgress(prev => prev.map((item, idx) => 
          item.fileName === file.name 
            ? { ...item, status: 'error', message: 'Processing failed', progress: 0 }
            : item
        ))
        toast.error(`Failed to process ${file.name}`)
      }
    }

    setIsProcessing(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
    handleFileUpload(e.dataTransfer.files)
  }

  const selectDocument = (document: DocumentParseResult) => {
    setCurrentDocument(document)
    // Stop any current speech
    if (speechRef.current) {
      speechRef.current.cancel()
      setIsPlaying(false)
    }
  }

  const startTextToSpeech = () => {
    if (!currentDocument || !speechRef.current || !selectedVoice) return

    const utterance = new SpeechSynthesisUtterance(currentDocument.text)
    utterance.voice = selectedVoice
    utterance.rate = speechRate
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onpause = () => setIsPlaying(false)
    utterance.onresume = () => setIsPlaying(true)

    speechRef.current.speak(utterance)
  }

  const pauseTextToSpeech = () => {
    if (speechRef.current) {
      speechRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resumeTextToSpeech = () => {
    if (speechRef.current) {
      speechRef.current.resume()
      setIsPlaying(true)
    }
  }

  const stopTextToSpeech = () => {
    if (speechRef.current) {
      speechRef.current.cancel()
      setIsPlaying(false)
    }
  }

  const downloadText = async (doc: DocumentParseResult) => {
    try {
      // In a real flow we would have a documentId from the server. For now, fallback to local text.
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/documents/${encodeURIComponent(doc.metadata.fileName)}/text`)
      if (response.ok) {
        const text = await response.text()
        const blob = new Blob([text || doc.text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${doc.metadata.fileName.replace(/\.[^/.]+$/, '')}_extracted.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Text downloaded successfully!')
      } else {
        // Fallback to client text
        const blob = new Blob([doc.text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${doc.metadata.fileName.replace(/\.[^/.]+$/, '')}_extracted.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Text downloaded (local copy).')
      }
    } catch (e) {
      toast.error('Failed to download text')
    }
  }

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName))
    setProcessedDocuments(prev => prev.filter(doc => doc.metadata.fileName !== fileName))
    setUploadProgress(prev => prev.filter(item => item.fileName !== fileName))
    
    if (currentDocument?.metadata.fileName === fileName) {
      setCurrentDocument(processedDocuments[0] || null)
    }
  }

  const getFileIcon = (fileType: string) => {
    return documentService.getFileIcon(fileType)
  }

  const formatFileSize = (bytes: number) => {
    return documentService.formatFileSize(bytes)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📖 Document Reader
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Upload and process documents, images, and PDFs with advanced OCR and text extraction capabilities.
            Get instant access to readable text from any document format.
          </p>
        </motion.div>

        {/* File Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Upload Documents
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Drag & drop files or click to browse. Supports PDF, DOCX, TXT, and images.
            </p>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center space-x-4 text-4xl">
                <DocumentTextIcon className="text-blue-500" />
                <PhotoIcon className="text-green-500" />
                <DocumentIcon className="text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop your files here
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse files
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Supported Formats */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supported formats: PDF, DOCX, DOC, TXT, JPG, PNG, GIF, WebP
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Maximum file size: 10MB per file
            </p>
          </div>
        </motion.div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Processing Progress
            </h3>
            <div className="space-y-3">
              {uploadProgress.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFileIcon('text/plain')}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.fileName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'error' ? 'bg-red-500' :
                          item.status === 'processing' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.progress}%
                    </span>
                    {item.status === 'completed' && (
                      <button
                        onClick={() => removeFile(item.fileName)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Document List */}
        {processedDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Processed Documents ({processedDocuments.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedDocuments.map((doc, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    currentDocument?.metadata.fileName === doc.metadata.fileName
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  onClick={() => selectDocument(doc)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{getFileIcon(doc.metadata.fileType)}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadText(doc)
                        }}
                        className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Download text"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 truncate">
                    {doc.metadata.fileName}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Size: {formatFileSize(doc.metadata.fileSize)}</p>
                    <p>Type: {doc.metadata.fileType.split('/')[1].toUpperCase()}</p>
                    {doc.metadata.language && <p>Language: {doc.metadata.language.toUpperCase()}</p>}
                    {doc.metadata.pageCount && <p>Pages: {doc.metadata.pageCount}</p>}
                    <p>Processing: {doc.metadata.processingTime}ms</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Document Viewer */}
        {currentDocument && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentDocument.metadata.fileName}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatFileSize(currentDocument.metadata.fileSize)}</span>
                  <span>•</span>
                  <span>{currentDocument.metadata.fileType.split('/')[1].toUpperCase()}</span>
                  {currentDocument.metadata.language && (
                    <>
                      <span>•</span>
                      <span>{currentDocument.metadata.language.toUpperCase()}</span>
                    </>
                  )}
                  {currentDocument.metadata.pageCount && (
                    <>
                      <span>•</span>
                      <span>{currentDocument.metadata.pageCount} pages</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                                 <button
                   onClick={() => downloadText(currentDocument)}
                   className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                 >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Download Text</span>
                </button>
              </div>
            </div>

            {/* Text-to-Speech Controls */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Text-to-Speech
                </h3>
                <div className="flex items-center space-x-2">
                  <SpeakerWaveIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voices = speechRef.current?.getVoices() || []
                      const voice = voices.find(v => v.name === e.target.value)
                      setSelectedVoice(voice || null)
                    }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {speechRef.current?.getVoices().map((voice, index) => (
                      <option key={index} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Speed:</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                    {speechRate}x
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {!isPlaying ? (
                    <button
                      onClick={startTextToSpeech}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>Play</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={pauseTextToSpeech}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                      >
                        <PauseIcon className="w-4 h-4" />
                        <span>Pause</span>
                      </button>
                      <button
                        onClick={resumeTextToSpeech}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <PlayIcon className="w-4 h-4" />
                        <span>Resume</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={stopTextToSpeech}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <StopIcon className="w-4 h-4" />
                    <span>Stop</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-6">
              {/* Document Structure */}
              {currentDocument.structure && currentDocument.structure.sections.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Document Structure
                  </h3>
                  <div className="space-y-2">
                    {currentDocument.structure.sections.map((section, index) => (
                      <div key={index} className="ml-4">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200">
                          {section.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                          {section.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR Results */}
              {currentDocument.ocrResults && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-900 dark:text-green-200 mb-3">
                    OCR Results
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Confidence: {(currentDocument.ocrResults.confidence * 100).toFixed(1)}%
                    </p>
                    <div className="space-y-1">
                      {currentDocument.ocrResults.textBlocks.map((block, index) => (
                        <div key={index} className="text-sm text-green-800 dark:text-green-100">
                          <span className="font-medium">Block {index + 1}:</span> {block.text}
                          <span className="text-green-600 dark:text-green-400 ml-2">
                            ({(block.confidence * 100).toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Text */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Extracted Text
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                    {currentDocument.text}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {processedDocuments.length === 0 && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center py-12"
          >
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No documents processed yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload a document to get started with text extraction and analysis.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
