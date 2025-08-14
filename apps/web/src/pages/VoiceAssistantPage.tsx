import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MicrophoneIcon as MicIcon, 
  MicrophoneIcon as MicOffIcon, 
  SpeakerWaveIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function VoiceAssistantPage() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        toast.success('🎤 Listening...')
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
          processMessage(finalTranscript)
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
        content: 'Hello! I\'m your Voice Assistant. I can help you with various tasks. Just speak or type your message.',
        timestamp: new Date()
      }
    ])

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const processMessage = async (content: string) => {
    setIsProcessing(true)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate response based on content
    let response = ''
    if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
      response = 'Hello! How can I help you today?'
    } else if (content.toLowerCase().includes('weather')) {
      response = 'I can help you check the weather. What city would you like to know about?'
    } else if (content.toLowerCase().includes('time')) {
      response = `The current time is ${new Date().toLocaleTimeString()}.`
    } else if (content.toLowerCase().includes('date')) {
      response = `Today is ${new Date().toLocaleDateString()}.`
    } else if (content.toLowerCase().includes('help')) {
      response = 'I can help you with various tasks like checking the weather, time, date, or answering questions. Just ask me anything!'
    } else {
      response = `I heard you say: "${content}". I'm here to help! You can ask me about the weather, time, date, or any other questions.`
    }

    // Add assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: response,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, assistantMessage])

    // Speak the response
    speakText(response)
    
    setIsProcessing(false)
    setTranscript('')
  }

  const speakText = (text: string) => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      
      synthesisRef.current.speak(utterance)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
  }

  const sendMessage = () => {
    const input = document.querySelector('input') as HTMLInputElement
    if (input?.value.trim()) {
      processMessage(input.value)
      input.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4"
          >
            <SpeakerWaveIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎤 Voice Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your AI-powered voice companion. Speak naturally and get intelligent responses with text-to-speech.
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
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg shadow-purple-500/50'
                  }`}
                >
                  {isListening ? <MicOffIcon className="w-8 h-8" /> : <MicIcon className="w-8 h-8" />}
                </motion.button>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {isListening ? 'Listening...' : 'Tap to speak'}
                </p>
              </div>

              {/* Status Indicators */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isListening ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isListening ? 'Active' : 'Standby'}
                  </span>
                </div>

                {isSpeaking && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Speaking</span>
                    <SpeakerWaveIcon className="w-4 h-4 text-blue-600 animate-pulse" />
                  </div>
                )}

                {isProcessing && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Processing</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  </div>
                )}
              </div>

              {/* Quick Commands */}
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Quick Commands
                </h3>
                <div className="space-y-2">
                  {[
                    'What\'s the weather?',
                    'What time is it?',
                    'What\'s today\'s date?',
                    'Can you help me?'
                  ].map((command, index) => (
                    <motion.button
                      key={command}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => processMessage(command)}
                      className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <p className="text-sm text-gray-900 dark:text-white">"{command}"</p>
                    </motion.button>
                  ))}
                </div>
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
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                      if (e.key === 'Enter') {
                        sendMessage()
                      }
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
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
            Voice Assistant Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MicIcon,
                title: 'Speech Recognition',
                description: 'Advanced voice recognition with natural language processing',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: SpeakerWaveIcon,
                title: 'Text-to-Speech',
                description: 'Natural-sounding voice synthesis with multiple voices',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: SparklesIcon,
                title: 'AI Responses',
                description: 'Intelligent responses powered by advanced AI models',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: ChatBubbleLeftRightIcon,
                title: 'Conversation Memory',
                description: 'Context-aware conversations with memory retention',
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
