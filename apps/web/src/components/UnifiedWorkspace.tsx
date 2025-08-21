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
  LanguageIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  ClipboardDocumentIcon,
  HeartIcon,
  ArrowPathIcon,
  EyeIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { documentService, DocumentParseResult, DocumentUploadProgress } from '../services/documentService'
import { documentApi } from '../services/realApi'
import { useTranslation } from '../hooks/useTranslation'
import { assistantService, AssistantMessage, ConversationContext, MultimodalInput } from '../services/assistantService'
import { analyticsService } from '../services/analyticsService'
import toast from 'react-hot-toast'

type WorkflowStage = 'upload' | 'process' | 'translate' | 'assistant' | 'accessibility'

interface UnifiedWorkspaceProps {
  className?: string
}

export function UnifiedWorkspace({ className = '' }: UnifiedWorkspaceProps) {
  // Document processing state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processedDocuments, setProcessedDocuments] = useState<DocumentParseResult[]>([])
  const [currentDocument, setCurrentDocument] = useState<DocumentParseResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Translation state
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState('en')
  const [targetLanguage, setTargetLanguage] = useState('es')
  const [isTranslating, setIsTranslating] = useState(false)

  // Assistant state
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([])
  const [assistantInput, setAssistantInput] = useState('')
  const [isAssistantLoading, setIsAssistantLoading] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<ConversationContext | null>(null)

  // TTS state
  const [isPlaying, setIsPlaying] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  // UI state
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('upload')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const speechRef = useRef<SpeechSynthesis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { translateText, isLoading: isTranslationLoading } = useTranslation()

  // Initialize speech synthesis and load data
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechRef.current = window.speechSynthesis
      speechRef.current.onvoiceschanged = () => {
        const voices = speechRef.current?.getVoices() || []
        setSelectedVoice(voices.find(voice => voice.lang === 'en-US') || voices[0] || null)
      }
    }

    // Create initial conversation
    createInitialConversation()

    // Track workspace view
    analyticsService.trackPageView('Unified Workspace', {
      page_type: 'workspace',
      user_role: 'user'
    })
  }, [])

  // Auto-scroll assistant messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [assistantMessages])

  // Voice command setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setupVoiceCommands()
    }
  }, [])

  const createInitialConversation = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'anonymous'
      const conversation = await assistantService.createConversation('Workspace Chat', userId)
      setCurrentConversation(conversation)
    } catch (error) {
      console.error('Failed to create conversation:', error)
    }
  }

  const setupVoiceCommands = () => {
    // Voice command implementation
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript.toLowerCase()
        handleVoiceCommand(command)
      }

      // Expose recognition for manual triggering
      ;(window as any).workspaceVoiceRecognition = recognition
    }
  }

  const handleVoiceCommand = (command: string) => {
    const commands = {
      'upload document': () => setCurrentStage('upload'),
      'process document': () => setCurrentStage('process'),
      'translate text': () => setCurrentStage('translate'),
      'open assistant': () => setCurrentStage('assistant'),
      'accessibility settings': () => setCurrentStage('accessibility'),
      'read document': () => currentDocument && handleTextToSpeech(currentDocument.text),
      'stop reading': () => stopTextToSpeech(),
      'translate document': () => currentDocument && translateDocumentText(),
      'next stage': () => handleNextStage(),
      'previous stage': () => handlePreviousStage()
    }

    for (const [voiceCommand, action] of Object.entries(commands)) {
      if (command.includes(voiceCommand)) {
        action()
        toast.success(`Voice command: ${voiceCommand}`)
        break
      }
    }
  }

  // Document processing functions
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
    setCurrentStage('process')
    
    // Initialize progress tracking
    const progressItems: DocumentUploadProgress[] = validFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading',
      message: 'Starting upload...'
    }))
    setUploadProgress(prev => [...prev, ...progressItems])

    // Process each file
    for (const file of validFiles) {
      try {
        setUploadProgress(prev => prev.map(item => 
          item.fileName === file.name 
            ? { ...item, status: 'processing', message: 'Processing with enhanced OCR...', progress: 50 }
            : item
        ))

        // Upload and process with new OCR endpoint
        try {
          const ocrResult = await documentApi.processDocumentWithOCR(file, { 
            language: 'auto', 
            enableTableDetection: true,
            enableLayoutAnalysis: true
          })
          
          // Use OCR result for processing
          const result = await documentService.processDocumentWithOCR(file, ocrResult)
          
          setUploadProgress(prev => prev.map(item => 
            item.fileName === file.name 
              ? { ...item, status: 'completed', message: 'OCR processing complete!', progress: 100 }
              : item
          ))

          setProcessedDocuments(prev => [...prev, result])
          
          if (!currentDocument) {
            setCurrentDocument(result)
            setInputText(result.text.substring(0, 1000)) // Populate translation text
          }

          toast.success(`${file.name} processed with enhanced OCR!`)
        } catch (ocrError) {
          // Fallback to local processing
          const result = await documentService.processDocument(file)
          setProcessedDocuments(prev => [...prev, result])
          
          setUploadProgress(prev => prev.map(item => 
            item.fileName === file.name 
              ? { ...item, status: 'completed', message: 'Local processing complete', progress: 100 }
              : item
          ))
          
          toast.success(`${file.name} processed locally (OCR fallback)`)
        }
      } catch (error) {
        console.error('Error processing file:', error)
        setUploadProgress(prev => prev.map(item => 
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

  // Translation functions
  const translateDocumentText = async () => {
    if (!currentDocument) return
    
    setInputText(currentDocument.text)
    await handleTranslate()
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    setCurrentStage('translate')
    
    try {
      const result = await translateText({
        text: inputText,
        sourceLanguage,
        targetLanguage
      })
      setTranslatedText(result.translatedText)
      
      analyticsService.trackEvent('translation', {
        sourceLanguage,
        targetLanguage, 
        text_length: inputText.length,
        success: true,
        source: 'unified_workspace'
      })

      toast.success('Translation completed!')
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  // Text-to-speech functions
  const handleTextToSpeech = (text: string, language?: string) => {
    if (!speechRef.current || !selectedVoice) return

    if (isPlaying) {
      stopTextToSpeech()
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = selectedVoice
    utterance.rate = speechRate
    utterance.lang = language || (sourceLanguage === 'en' ? 'en-US' : `${sourceLanguage}-${sourceLanguage.toUpperCase()}`)
    
    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onpause = () => setIsPlaying(false)
    utterance.onresume = () => setIsPlaying(true)

    speechRef.current.speak(utterance)
  }

  const stopTextToSpeech = () => {
    if (speechRef.current) {
      speechRef.current.cancel()
      setIsPlaying(false)
    }
  }

  // Assistant functions
  const handleAssistantMessage = async () => {
    if (!assistantInput.trim() || isAssistantLoading) return

    setIsAssistantLoading(true)
    setCurrentStage('assistant')
    
    try {
      const userMessage: AssistantMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: assistantInput,
        timestamp: Date.now()
      }

      setAssistantMessages(prev => [...prev, userMessage])
      setAssistantInput('')

      // Include document context if available
      const contextText = currentDocument ? `Document context: ${currentDocument.text.substring(0, 500)}...` : ''
      const fullInput = contextText ? `${contextText}\n\nUser question: ${assistantInput}` : assistantInput

      const multimodalInput: MultimodalInput = {
        text: fullInput,
        context: currentDocument?.metadata.fileName,
        language: sourceLanguage
      }

      const response = await assistantService.sendMessage(multimodalInput, currentConversation?.id)
      setAssistantMessages(prev => [...prev, response.message])

      toast.success('Assistant response received!')
    } catch (error) {
      console.error('Assistant error:', error)
      toast.error('Failed to get assistant response')
    } finally {
      setIsAssistantLoading(false)
    }
  }

  // Navigation functions
  const handleNextStage = () => {
    const stages: WorkflowStage[] = ['upload', 'process', 'translate', 'assistant', 'accessibility']
    const currentIndex = stages.indexOf(currentStage)
    const nextIndex = (currentIndex + 1) % stages.length
    setCurrentStage(stages[nextIndex])
  }

  const handlePreviousStage = () => {
    const stages: WorkflowStage[] = ['upload', 'process', 'translate', 'assistant', 'accessibility']
    const currentIndex = stages.indexOf(currentStage)
    const prevIndex = currentIndex === 0 ? stages.length - 1 : currentIndex - 1
    setCurrentStage(stages[prevIndex])
  }

  const handleKeyboardShortcuts = (e: React.KeyboardEvent) => {
    if (e.altKey) {
      switch (e.key) {
        case '1':
          e.preventDefault()
          setCurrentStage('upload')
          break
        case '2':
          e.preventDefault()
          setCurrentStage('process')
          break
        case '3':
          e.preventDefault()
          setCurrentStage('translate')
          break
        case '4':
          e.preventDefault()
          setCurrentStage('assistant')
          break
        case '5':
          e.preventDefault()
          setCurrentStage('accessibility')
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNextStage()
          break
        case 'ArrowLeft':
          e.preventDefault()
          handlePreviousStage()
          break
      }
    }
  }

  const getStageIcon = (stage: WorkflowStage) => {
    const icons = {
      upload: DocumentIcon,
      process: DocumentTextIcon,
      translate: LanguageIcon,
      assistant: ChatBubbleLeftRightIcon,
      accessibility: Cog6ToothIcon
    }
    return icons[stage]
  }

  const getStageTitle = (stage: WorkflowStage) => {
    const titles = {
      upload: 'Upload Documents',
      process: 'Process & Extract',
      translate: 'Translate Text',
      assistant: 'AI Assistant',
      accessibility: 'Accessibility Settings'
    }
    return titles[stage]
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${className}`}
         onKeyDown={handleKeyboardShortcuts}
         tabIndex={0}
    >
      <div className="flex h-screen">
        {/* Left Sidebar - Document List & Navigation */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-white dark:bg-gray-800 shadow-xl flex flex-col`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Workspace
                </h2>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <PlusIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Workflow Navigation */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Workflow Stages
              </h3>
              <div className="space-y-2">
                {(['upload', 'process', 'translate', 'assistant', 'accessibility'] as WorkflowStage[]).map((stage, index) => {
                  const Icon = getStageIcon(stage)
                  return (
                    <button
                      key={stage}
                      onClick={() => setCurrentStage(stage)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all ${
                        currentStage === stage
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label={`Go to ${getStageTitle(stage)} (Alt+${index + 1})`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{getStageTitle(stage)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Document List */}
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Documents ({processedDocuments.length})
                </h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Upload new document"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {processedDocuments.map((doc, index) => {
                  // Safety check for doc structure
                  if (!doc || !doc.metadata) {
                    return null;
                  }
                  
                  return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      currentDocument?.metadata?.fileName === doc.metadata.fileName
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setCurrentDocument(doc)}
                  >
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.metadata.fileName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {documentService.formatFileSize(doc.metadata.fileSize)} • {doc.metadata.fileType.split('/')[1].toUpperCase()}
                    </div>
                  </div>
                  )
                })}
                
                {processedDocuments.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <DocumentIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No documents yet</p>
                    <p className="text-xs">Upload to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voice Command Button */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  if ((window as any).workspaceVoiceRecognition) {
                    (window as any).workspaceVoiceRecognition.start()
                    toast.success('Voice command listening...')
                  }
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                aria-label="Activate voice commands"
              >
                <MicrophoneIcon className="w-4 h-4" />
                <span className="text-sm">Voice Commands</span>
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.gif,.webp,.tiff,.bmp"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🚀 Unified Workspace
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {getStageTitle(currentStage)} - Streamlined workflow for document processing, translation, and AI assistance
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePreviousStage}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Previous stage (Alt+Left)"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNextStage}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  aria-label="Next stage (Alt+Right)"
                >
                  Next →
                </button>
              </div>
            </div>
          </motion.div>

          {/* Dynamic Content Based on Current Stage */}
          <div className="flex-1 overflow-hidden">
            {currentStage === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="h-full p-6 overflow-y-auto"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      📁 Upload Documents
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                      Drag & drop files or click to browse. Enhanced OCR processing with table detection.
                    </p>
                  </div>

                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-6">
                      <div className="flex justify-center space-x-6 text-6xl">
                        <DocumentTextIcon className="text-blue-500" />
                        <PhotoIcon className="text-green-500" />
                        <DocumentIcon className="text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-medium text-gray-900 dark:text-white mb-4">
                          Drop your files here
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Supports PDF, DOCX, TXT, images with advanced OCR and table detection
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                        >
                          Choose Files
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress.length > 0 && (
                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Processing Progress
                      </h3>
                      <div className="space-y-3">
                        {uploadProgress.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{item.fileName}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.message}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all duration-300 ${
                                    item.status === 'completed' ? 'bg-green-500' :
                                    item.status === 'error' ? 'bg-red-500' :
                                    item.status === 'processing' ? 'bg-blue-500' : 'bg-gray-400'
                                  }`}
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                                {item.progress}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStage === 'process' && currentDocument && (
              <motion.div
                key="process"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="h-full p-6 overflow-y-auto"
              >
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      🔍 Document Processing
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                      Enhanced OCR results with table detection and layout analysis
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {currentDocument.metadata.fileName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span>{documentService.formatFileSize(currentDocument.metadata.fileSize)}</span>
                          <span>•</span>
                          <span>{currentDocument.metadata.fileType.split('/')[1].toUpperCase()}</span>
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
                          onClick={() => handleTextToSpeech(currentDocument.text)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            isPlaying 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isPlaying ? <StopIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
                          <span>{isPlaying ? 'Stop' : 'Listen'}</span>
                        </button>
                        <button
                          onClick={translateDocumentText}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <LanguageIcon className="w-4 h-4" />
                          <span>Translate</span>
                        </button>
                      </div>
                    </div>

                    {/* Enhanced OCR Results */}
                    {currentDocument.ocrResults && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                        <h4 className="text-lg font-medium text-green-900 dark:text-green-200 mb-3">
                          🎯 Enhanced OCR Results
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {(currentDocument.ocrResults.confidence * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">Confidence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {currentDocument.ocrResults.textBlocks?.length || 0}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">Text Blocks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {currentDocument.ocrResults.tables?.length || 0}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">Tables Found</div>
                          </div>
                        </div>
                        
                        {/* Table Display */}
                        {currentDocument.ocrResults.tables && currentDocument.ocrResults.tables.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium text-green-900 dark:text-green-200 mb-2">Detected Tables:</h5>
                            {currentDocument.ocrResults.tables.map((table, index) => (
                              <div key={index} className="mb-4 overflow-x-auto">
                                <table className="min-w-full bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded">
                                  <tbody>
                                    {table.rows.map((row, rowIndex) => (
                                      <tr key={rowIndex}>
                                        {row.cells.map((cell, cellIndex) => (
                                          <td key={cellIndex} className="px-3 py-2 border border-green-200 dark:border-green-700 text-sm">
                                            {cell.text}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Extracted Text */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        📄 Extracted Text
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                          {currentDocument.text}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStage === 'translate' && (
              <motion.div
                key="translate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="h-full p-6 overflow-y-auto"
              >
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      🌍 Translation Hub
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                      Translate extracted text or custom content with AI-powered accuracy
                    </p>
                  </div>

                  {/* Language Selection */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Source Language
                        </label>
                        <select
                          value={sourceLanguage}
                          onChange={(e) => setSourceLanguage(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">🇺🇸 English</option>
                          <option value="es">🇪🇸 Spanish</option>
                          <option value="fr">🇫🇷 French</option>
                          <option value="de">🇩🇪 German</option>
                          <option value="it">🇮🇹 Italian</option>
                          <option value="pt">🇵🇹 Portuguese</option>
                          <option value="ru">🇷🇺 Russian</option>
                          <option value="ja">🇯🇵 Japanese</option>
                          <option value="ko">🇰🇷 Korean</option>
                          <option value="zh">🇨🇳 Chinese</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          const temp = sourceLanguage
                          setSourceLanguage(targetLanguage)
                          setTargetLanguage(temp)
                          setInputText(translatedText)
                          setTranslatedText('')
                        }}
                        className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title="Swap languages"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                      </button>

                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Target Language
                        </label>
                        <select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">🇺🇸 English</option>
                          <option value="es">🇪🇸 Spanish</option>
                          <option value="fr">🇫🇷 French</option>
                          <option value="de">🇩🇪 German</option>
                          <option value="it">🇮🇹 Italian</option>
                          <option value="pt">🇵🇹 Portuguese</option>
                          <option value="ru">🇷🇺 Russian</option>
                          <option value="ja">🇯🇵 Japanese</option>
                          <option value="ko">🇰🇷 Korean</option>
                          <option value="zh">🇨🇳 Chinese</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Translation Interface */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Input Text
                        </h3>
                        <button
                          onClick={() => currentDocument && setInputText(currentDocument.text)}
                          disabled={!currentDocument}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          Use Document
                        </button>
                      </div>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter text to translate..."
                        className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {inputText.length} characters
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTextToSpeech(inputText, sourceLanguage)}
                            disabled={!inputText.trim()}
                            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
                            title="Listen to input text"
                          >
                            <SpeakerWaveIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setInputText('')}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Output */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Translation
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTextToSpeech(translatedText, targetLanguage)}
                            disabled={!translatedText.trim()}
                            className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 disabled:opacity-50 transition-colors"
                            title="Listen to translation"
                          >
                            <SpeakerWaveIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(translatedText)}
                            disabled={!translatedText.trim()}
                            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
                            title="Copy translation"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 overflow-y-auto">
                        {translatedText ? (
                          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{translatedText}</p>
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
                        <button
                          onClick={handleTranslate}
                          disabled={!inputText.trim() || isTranslating}
                          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {isTranslating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Translating...</span>
                            </>
                          ) : (
                            <>
                              <LanguageIcon className="w-4 h-4" />
                              <span>Translate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStage === 'assistant' && (
              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        🤖 AI Assistant
                      </h2>
                      <p className="text-xl text-gray-600 dark:text-gray-300">
                        Get help with documents, translations, and more using AI assistance
                      </p>
                    </div>

                    {/* Chat Messages */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-96 flex flex-col">
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {assistantMessages.length === 0 && (
                          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                            <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg mb-2">Start a conversation with your AI assistant</p>
                            <p className="text-sm">Ask about your documents, request translations, or get help with the platform</p>
                            {currentDocument && (
                              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  📄 Current document: {currentDocument.metadata.fileName}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {assistantMessages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                message.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className="text-xs opacity-70 text-right mt-2">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Assistant Input */}
                      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-end space-x-3">
                          <div className="flex-1">
                            <textarea
                              value={assistantInput}
                              onChange={(e) => setAssistantInput(e.target.value)}
                              placeholder={currentDocument ? `Ask about ${currentDocument.metadata.fileName}...` : "Ask your AI assistant anything..."}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleAssistantMessage()
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={handleAssistantMessage}
                            disabled={!assistantInput.trim() || isAssistantLoading}
                            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {isAssistantLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <PaperAirplaneIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStage === 'accessibility' && (
              <motion.div
                key="accessibility"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="h-full p-6 overflow-y-auto"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      ♿ Accessibility Settings
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300">
                      Configure voice, visual, and navigation preferences
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Voice Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <SpeakerWaveIcon className="w-5 h-5 mr-2" />
                        Voice Settings
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Voice
                          </label>
                          <select
                            value={selectedVoice?.name || ''}
                            onChange={(e) => {
                              const voices = speechRef.current?.getVoices() || []
                              setSelectedVoice(voices.find(v => v.name === e.target.value) || null)
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {speechRef.current?.getVoices().map((voice, index) => (
                              <option key={index} value={voice.name}>
                                {voice.name} ({voice.lang})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Speech Rate: {speechRate}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={speechRate}
                            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTextToSpeech('This is a voice test')}
                            className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Test Voice
                          </button>
                          <button
                            onClick={stopTextToSpeech}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Stop
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🔣 Keyboard Shortcuts
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Upload Documents</span>
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + 1</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Process Documents</span>
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + 2</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Translation</span>
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + 3</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">AI Assistant</span>
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + 4</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Accessibility</span>
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + 5</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Next Stage</span>
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + →</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Previous Stage</span>
                          <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Alt + ←</code>
                        </div>
                      </div>
                    </div>

                    {/* Voice Commands */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <MicrophoneIcon className="w-5 h-5 mr-2" />
                        Voice Commands
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>"Upload document" - Go to upload stage</p>
                        <p>"Process document" - Go to processing stage</p>
                        <p>"Translate text" - Go to translation stage</p>
                        <p>"Open assistant" - Go to AI assistant</p>
                        <p>"Read document" - Start text-to-speech</p>
                        <p>"Stop reading" - Stop text-to-speech</p>
                        <p>"Next stage" - Move to next workflow stage</p>
                        <p>"Previous stage" - Move to previous stage</p>
                      </div>
                      <button
                        onClick={() => {
                          if ((window as any).workspaceVoiceRecognition) {
                            (window as any).workspaceVoiceRecognition.start()
                            toast.success('Voice command listening...')
                          } else {
                            toast.error('Voice recognition not available')
                          }
                        }}
                        className="w-full mt-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                      >
                        Activate Voice Commands
                      </button>
                    </div>

                    {/* Visual Settings */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <EyeIcon className="w-5 h-5 mr-2" />
                        Visual Settings
                      </h3>
                      <div className="space-y-4">
                        <button
                          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
                        </button>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>• High contrast mode available in system settings</p>
                          <p>• Screen reader compatible interface</p>
                          <p>• Focus indicators for keyboard navigation</p>
                          <p>• ARIA labels and landmarks throughout</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}