import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MicrophoneIcon as MicIcon, 
  MicrophoneIcon as MicOffIcon, 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  EyeIcon,
  CameraIcon,
  DocumentTextIcon,
  MapIcon,
  Cog6ToothIcon as CogIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface AssistantMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: string
}

interface VoiceCommand {
  command: string
  description: string
  action: string
  icon: React.ComponentType<any>
}

export function GeminiAssistantPage() {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentTask, setCurrentTask] = useState('')
  const [assistantMode, setAssistantMode] = useState<'general' | 'navigation' | 'reading' | 'object'>('general')
  
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  // Voice commands for blind users
  const voiceCommands: VoiceCommand[] = [
    {
      command: 'hey gemini',
      description: 'Activate Gemini Assistant',
      action: 'activate',
      icon: SparklesIcon
    },
    {
      command: 'describe scene',
      description: 'Describe what you see around you',
      action: 'scene_description',
      icon: EyeIcon
    },
    {
      command: 'read document',
      description: 'Read uploaded document aloud',
      action: 'read_document',
      icon: DocumentTextIcon
    },
    {
      command: 'navigate to',
      description: 'Get navigation assistance',
      action: 'navigate',
      icon: MapIcon
    },
    {
      command: 'identify object',
      description: 'Identify objects in camera view',
      action: 'identify_object',
      icon: CameraIcon
    },
    {
      command: 'settings',
      description: 'Open accessibility settings',
      action: 'settings',
      icon: CogIcon
    }
  ]

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        toast.success('🎤 Listening for voice commands...')
      }

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript)
          processVoiceCommand(finalTranscript.toLowerCase())
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error('Voice recognition error. Please try again.')
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    // Initialize speech synthesis
    synthesisRef.current = window.speechSynthesis

    // Add welcome message
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Hello! I\'m your Gemini Assistant. Say "Hey Gemini" to activate me, or use any of the voice commands below.',
        timestamp: new Date()
      }
    ])

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true)
    
    // Add user message
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: command,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Process command
    let response = ''
    let action = ''

    if (command.includes('hey gemini') || command.includes('activate')) {
      response = 'Hello! I\'m here to help. What would you like me to do? I can describe scenes, read documents, help with navigation, identify objects, and much more.'
      action = 'activated'
    } else if (command.includes('describe scene') || command.includes('what do you see')) {
      response = 'I\'ll analyze the scene around you. Please point your camera or describe what you\'re looking at, and I\'ll provide a detailed description.'
      action = 'scene_analysis'
      setAssistantMode('object')
    } else if (command.includes('read document') || command.includes('read this')) {
      response = 'I\'m ready to read documents for you. Please upload a PDF, Word document, or take a photo of text, and I\'ll read it aloud with proper formatting.'
      action = 'document_reading'
      setAssistantMode('reading')
    } else if (command.includes('navigate') || command.includes('directions')) {
      response = 'I\'ll help you navigate. Where would you like to go? I can provide step-by-step directions, identify landmarks, and help you avoid obstacles.'
      action = 'navigation'
      setAssistantMode('navigation')
    } else if (command.includes('identify') || command.includes('what is this')) {
      response = 'I\'ll identify objects for you. Point your camera at the object or describe what you\'re touching, and I\'ll tell you what it is.'
      action = 'object_identification'
      setAssistantMode('object')
    } else if (command.includes('settings') || command.includes('preferences')) {
      response = 'Opening accessibility settings. I can adjust voice speed, language, sound effects, and other preferences to make your experience better.'
      action = 'settings'
    } else {
      response = 'I heard you say: "' + command + '". How can I help you with that? You can ask me to describe scenes, read documents, help with navigation, or identify objects.'
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Add assistant response
    const assistantMessage: AssistantMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      action
    }
    setMessages(prev => [...prev, assistantMessage])

    // Speak the response
    speakText(response)
    
    setIsProcessing(false)
    setTranscript('')
  }

  const speakText = (text: string) => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel() // Stop any current speech
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      
      synthesisRef.current.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const repeatLastMessage = () => {
    const lastAssistantMessage = messages
      .filter(m => m.type === 'assistant')
      .pop()
    
    if (lastAssistantMessage) {
      speakText(lastAssistantMessage.content)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full mb-4"
          >
            <SparklesIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🤖 Gemini Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your AI-powered accessibility companion. Say "Hey Gemini" to activate voice commands and get assistance with daily tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Control Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <MicIcon className="w-6 h-6 mr-2 text-purple-600" />
                Voice Control
              </h2>

              {/* Voice Activation Button */}
              <div className="text-center mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleListening}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 ${
                    isListening 
                      ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-600 shadow-lg shadow-purple-500/50'
                  }`}
                >
                  {isListening ? <MicOffIcon className="w-8 h-8" /> : <MicIcon className="w-8 h-8" />}
                </motion.button>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {isListening ? 'Listening...' : 'Tap to activate'}
                </p>
              </div>

              {/* Current Status */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isListening ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isListening ? 'Active' : 'Standby'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {assistantMode}
                  </span>
                </div>

                {isSpeaking && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Speaking</span>
                    <SpeakerWaveIcon className="w-4 h-4 text-blue-600 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={repeatLastMessage}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Repeat Last Message
                </button>
              </div>
            </motion.div>

            {/* Voice Commands */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Voice Commands
              </h3>
              <div className="space-y-3">
                {voiceCommands.map((cmd, index) => (
                  <motion.div
                    key={cmd.command}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => processVoiceCommand(cmd.command)}
                  >
                    <cmd.icon className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        "{cmd.command}"
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {cmd.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl h-[600px] flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-purple-600" />
                    Conversation
                  </h3>
                  <div className="flex items-center space-x-2">
                    {isProcessing && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.type === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Current Transcript */}
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                      <p className="text-sm italic">"{transcript}"</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Type a message or use voice commands..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        processVoiceCommand(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input') as HTMLInputElement
                      if (input?.value.trim()) {
                        processVoiceCommand(input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Accessibility Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: EyeIcon,
                title: 'Scene Description',
                description: 'AI-powered visual description for blind users',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: DocumentTextIcon,
                title: 'Document Reading',
                description: 'Read PDFs, Word docs, and handwritten text',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: MapIcon,
                title: 'Navigation',
                description: 'Voice-guided navigation and obstacle detection',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: CameraIcon,
                title: 'Object Recognition',
                description: 'Identify objects, people, and text in real-time',
                color: 'from-orange-500 to-red-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
