import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  TrashIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { assistantService, AssistantMessage, ConversationContext, MultimodalInput } from '../services/assistantService'
import toast from 'react-hot-toast'

export default function GeminiAssistantPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversations, setConversations] = useState<ConversationContext[]>([])
  const [currentConversation, setCurrentConversation] = useState<ConversationContext | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Load existing conversations
    loadConversations()
    
    // Create default conversation if none exist
    if (conversations.length === 0) {
      createNewConversation()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText])

  const loadConversations = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'anonymous'
      const userConversations = await assistantService.getUserConversations(userId)
      setConversations(userConversations)
      
      if (userConversations.length > 0 && !currentConversation) {
        setCurrentConversation(userConversations[0])
        setMessages(userConversations[0].messages)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  const createNewConversation = async () => {
    try {
      const userId = localStorage.getItem('userId') || 'anonymous'
      const newConversation = await assistantService.createConversation('New Conversation', userId)
      setCurrentConversation(newConversation)
      setMessages([])
      setConversations(prev => [newConversation, ...prev])
      toast.success('New conversation started!')
    } catch (error) {
      console.error('Failed to create conversation:', error)
      toast.error('Failed to create new conversation')
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return
    if (isLoading) return

    setIsLoading(true)
    setStreamingText('')

    try {
      // Create user message
      const userMessage: AssistantMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: inputText,
        timestamp: Date.now(),
        metadata: {
          attachments: selectedFiles.map(file => ({
            type: file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('audio/') ? 'audio' : 'document',
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size
          }))
        }
      }

      // Add user message to chat
      setMessages(prev => [...prev, userMessage])
      setInputText('')
      setSelectedFiles([])

      // Prepare multimodal input
      const multimodalInput: MultimodalInput = {
        text: inputText,
        images: selectedFiles.filter(f => f.type.startsWith('image/')),
        documents: selectedFiles.filter(f => !f.type.startsWith('image/') && !f.type.startsWith('audio/')),
        audio: selectedFiles.find(f => f.type.startsWith('audio/')) || undefined,
        context: currentConversation?.metadata?.topic || undefined,
        language: currentConversation?.metadata?.language || 'en'
      }

      // Get AI response
      const response = await assistantService.sendMessage(
        multimodalInput,
        currentConversation?.id
      )

      // Add assistant message to chat
      setMessages(prev => [...prev, response.message])

      // Update conversation metadata if needed
      if (currentConversation && response.message.content) {
        const updatedConversation = { ...currentConversation }
        if (!updatedConversation.metadata) {
          updatedConversation.metadata = {}
        }
        
        // Update topic if not set
        if (!updatedConversation.metadata.topic && inputText.length > 10) {
          updatedConversation.metadata.topic = inputText.substring(0, 50) + '...'
        }
        
        // Update language if detected
        if (!updatedConversation.metadata.language) {
          updatedConversation.metadata.language = 'en'
        }
        
        setCurrentConversation(updatedConversation)
      }

      // Show suggestions if available
      if (response.suggestions && response.suggestions.length > 0) {
        setShowSuggestions(true)
      }

      toast.success('Message sent successfully!')
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStreamingResponse = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) return
    if (isLoading) return

    setIsLoading(true)
    setStreamingText('')

    try {
      // Create user message
      const userMessage: AssistantMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: inputText,
        timestamp: Date.now(),
        metadata: {
          attachments: selectedFiles.map(file => ({
            type: file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('audio/') ? 'audio' : 'document',
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size
          }))
        }
      }

      setMessages(prev => [...prev, userMessage])
      setInputText('')
      setSelectedFiles([])

      // Stream response
      const multimodalInput: MultimodalInput = {
        text: inputText,
        images: selectedFiles.filter(f => f.type.startsWith('image/')),
        documents: selectedFiles.filter(f => !f.type.startsWith('image/') && !f.type.startsWith('audio/')),
        audio: selectedFiles.find(f => f.type.startsWith('audio/')) || undefined
      }

      let fullResponse = ''
      for await (const chunk of assistantService.streamResponse(multimodalInput, currentConversation || undefined)) {
        fullResponse += chunk
        setStreamingText(fullResponse)
      }

      // Create final assistant message
      const assistantMessage: AssistantMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now()
      }

      setMessages(prev => [...prev, assistantMessage])
      setStreamingText('')

      // Save conversation
      if (currentConversation) {
        await assistantService.saveConversation(
          currentConversation.id,
          userMessage,
          assistantMessage
        )
      }

      toast.success('Streaming response completed!')
    } catch (error) {
      console.error('Failed to stream response:', error)
      toast.error('Failed to get streaming response')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`)
        return false
      }
      return true
    })

    setSelectedFiles(prev => [...prev, ...validFiles])
    toast.success(`${validFiles.length} file(s) selected`)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' })
        setSelectedFiles(prev => [...prev, audioFile])
        toast.success('Voice recording saved!')
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast.success('Recording started...')
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      toast.success('Recording stopped!')
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion)
    setShowSuggestions(false)
  }

  const deleteConversation = async (conversationId: string) => {
    try {
      await assistantService.deleteConversation(conversationId)
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      
      if (currentConversation?.id === conversationId) {
        if (conversations.length > 1) {
          const nextConversation = conversations.find(c => c.id !== conversationId)
          setCurrentConversation(nextConversation || null)
          setMessages(nextConversation?.messages || [])
        } else {
          createNewConversation()
        }
      }
      
      toast.success('Conversation deleted!')
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  const switchConversation = (conversation: ConversationContext) => {
    setCurrentConversation(conversation)
    setMessages(conversation.messages)
    setShowSuggestions(false)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.startsWith('audio/')) return '🎵'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    return '📁'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
            🤖 Gemini AI Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your intelligent AI companion for conversations, document analysis, image understanding, and more.
            Experience the power of multimodal AI assistance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conversations
                </h2>
                <button
                  onClick={createNewConversation}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="New conversation"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentConversation?.id === conversation.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => switchConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conversation.messages.length} messages
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(conversation.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete conversation"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {currentConversation?.title || 'New Conversation'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentConversation?.metadata?.topic || 'Start a conversation with your AI assistant'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Start a conversation with your AI assistant</p>
                    <p className="text-sm mt-2">You can ask questions, upload files, or record voice messages</p>
                  </div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Message content */}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Attachments */}
                        {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                          <div className="space-y-2">
                            {message.metadata.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs opacity-80">
                                <span>{getFileIcon(attachment.type)}</span>
                                <span>{attachment.name}</span>
                                <span>({formatFileSize(attachment.size)})</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <p className="text-xs opacity-70 text-right">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Streaming response */}
                {streamingText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <p className="text-sm whitespace-pre-wrap">{streamingText}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">AI is typing...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 pb-4"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Suggestions:</span>
                    {['Help with translation', 'Process a document', 'Analyze an image', 'Platform features'].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Input Area */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                {/* File attachments */}
                {selectedFiles.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input controls */}
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={3}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {/* File upload */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Attach files"
                    >
                      <PaperClipIcon className="w-5 h-5" />
                    </button>
                    
                    {/* Voice recording */}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-3 rounded-lg transition-colors ${
                        isRecording
                          ? 'text-red-600 bg-red-100 dark:bg-red-900/20'
                          : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                      title={isRecording ? 'Stop recording' : 'Start voice recording'}
                    >
                      {isRecording ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
                    </button>
                    
                    {/* Send button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || (!inputText.trim() && selectedFiles.length === 0)}
                      className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Send message"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                    
                    {/* Streaming button */}
                    <button
                      onClick={handleStreamingResponse}
                      disabled={isLoading || (!inputText.trim() && selectedFiles.length === 0)}
                      className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Get streaming response"
                    >
                      <PlayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Help text */}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <p>💡 <strong>Tips:</strong> Upload images for analysis, documents for processing, or record voice messages</p>
                  <p>🎯 <strong>Features:</strong> Multimodal AI, conversation memory, file attachments, voice input</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
