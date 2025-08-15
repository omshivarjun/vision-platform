// Multimodal AI Assistant Service for Gemini and other AI models
export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  metadata?: {
    attachments?: Array<{
      type: 'image' | 'document' | 'audio'
      url: string
      name: string
      size: number
    }>
    language?: string
    confidence?: number
    processingTime?: number
  }
}

export interface ConversationContext {
  id: string
  userId?: string
  title: string
  messages: AssistantMessage[]
  createdAt: number
  updatedAt: number
  metadata?: {
    language?: string
    topic?: string
    tags?: string[]
  }
}

export interface AssistantResponse {
  message: AssistantMessage
  suggestions?: string[]
  actions?: Array<{
    type: 'translate' | 'summarize' | 'analyze' | 'generate'
    description: string
    parameters?: Record<string, any>
  }>
  confidence: number
  processingTime: number
}

export interface MultimodalInput {
  text?: string
  images?: File[]
  documents?: File[]
  audio?: File
  context?: string
  language?: string
}

// Assistant service
export const assistantService = {
  // Send message to assistant
  async sendMessage(
    input: MultimodalInput,
    conversationId?: string,
    context?: ConversationContext
  ): Promise<AssistantResponse> {
    const startTime = Date.now()
    
    try {
      // Process multimodal input
      const processedInput = await this.processMultimodalInput(input)
      
      // Create user message
      const userMessage: AssistantMessage = {
        id: this.generateMessageId(),
        role: 'user',
        content: processedInput.text || '',
        timestamp: Date.now(),
        metadata: {
          attachments: processedInput.attachments,
          language: processedInput.language,
        },
      }

      // Get AI response
      const response = await this.getAIResponse(processedInput, context)
      
      // Create assistant message
      const assistantMessage: AssistantMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        metadata: {
          confidence: response.confidence,
          processingTime: Date.now() - startTime,
        },
      }

      // Save conversation if ID provided
      if (conversationId) {
        await this.saveConversation(conversationId, userMessage, assistantMessage)
      }

      return {
        message: assistantMessage,
        suggestions: response.suggestions,
        actions: response.actions as Array<{
          type: "translate" | "summarize" | "analyze" | "generate";
          description: string;
          parameters?: Record<string, any>;
        }>,
        confidence: response.confidence,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error('Assistant service error:', error)
      throw error
    }
  },

  // Process multimodal input
  async processMultimodalInput(input: MultimodalInput) {
    const processed = {
      text: input.text || '',
      attachments: [] as Array<{
        type: 'image' | 'document' | 'audio'
        url: string
        name: string
        size: number
      }>,
      language: input.language || 'en',
    }

    // Process images
    if (input.images && input.images.length > 0) {
      for (const image of input.images) {
        const imageUrl = await this.uploadFile(image)
        processed.attachments.push({
          type: 'image',
          url: imageUrl,
          name: image.name,
          size: image.size,
        })
        
        // Add image description to text
        const imageDescription = await this.analyzeImage(image)
        processed.text += `\n[Image: ${imageDescription}]`
      }
    }

    // Process documents
    if (input.documents && input.documents.length > 0) {
      for (const document of input.documents) {
        const documentUrl = await this.uploadFile(document)
        processed.attachments.push({
          type: 'document',
          url: documentUrl,
          name: document.name,
          size: document.size,
        })
        
        // Extract text from document
        const documentText = await this.extractDocumentText(document)
        processed.text += `\n[Document: ${documentText}]`
      }
    }

    // Process audio
    if (input.audio) {
      const audioUrl = await this.uploadFile(input.audio)
      processed.attachments.push({
        type: 'audio',
        url: audioUrl,
        name: input.audio.name,
        size: input.audio.size,
      })
      
      // Transcribe audio
      const transcription = await this.transcribeAudio(input.audio)
      processed.text += `\n[Audio: ${transcription}]`
    }

    return processed
  },

  // Get AI response (simulated for now)
  async getAIResponse(input: any, context?: ConversationContext): Promise<{
    content: string
    suggestions: string[]
    actions: Array<{ type: string; description: string; parameters?: Record<string, any> }>
    confidence: number
  }> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate contextual response based on input
    let content = ''
    const suggestions: string[] = []
    const actions: Array<{ type: string; description: string; parameters?: Record<string, any> }> = []

    if (input.text.includes('translate') || input.text.includes('traducir')) {
      content = `I can help you with translation! I detected you're asking about translation services. 

The Vision Platform supports:
- Text translation between 50+ languages
- Image translation with OCR
- Document translation
- Voice translation

Would you like me to help you translate something specific?`
      
      suggestions.push('Translate "Hello world" to Spanish', 'Show supported languages', 'Help with image translation')
      actions.push({
        type: 'translate',
        description: 'Start translation',
        parameters: { sourceLanguage: 'auto', targetLanguage: 'es' }
      })
    } else if (input.text.includes('document') || input.text.includes('read')) {
      content = `I can help you with document processing! 

I can:
- Extract text from PDFs, Word documents, and images
- Perform OCR on scanned documents
- Summarize long documents
- Answer questions about document content
- Translate documents

What type of document would you like me to help you with?`
      
      suggestions.push('Upload a PDF', 'Process an image', 'Summarize text')
      actions.push({
        type: 'analyze',
        description: 'Analyze document',
        parameters: { analysisType: 'summary' }
      })
    } else if (input.text.includes('image') || input.text.includes('photo')) {
      content = `I can help you analyze images! 

I can:
- Describe what I see in images
- Extract text using OCR
- Identify objects and scenes
- Provide accessibility descriptions
- Translate text found in images

Upload an image and I'll help you analyze it!`
      
      suggestions.push('Describe this image', 'Extract text', 'Identify objects')
      actions.push({
        type: 'analyze',
        description: 'Analyze image',
        parameters: { analysisType: 'description' }
      })
    } else {
      content = `Hello! I'm your AI assistant for the Vision Platform. I can help you with:

🤖 **AI Assistant**: Ask me questions, get help, or have a conversation
🌍 **Translation**: Translate text, images, and documents between languages
📖 **Document Reading**: Process and analyze PDFs, Word docs, and images
♿ **Accessibility**: Get descriptions and analysis for visual content
📊 **Analytics**: Understand your usage and platform statistics

What would you like help with today?`
      
      suggestions.push('Help with translation', 'Process a document', 'Analyze an image', 'Platform features')
      actions.push({
        type: 'generate',
        description: 'Show help',
        parameters: { helpType: 'overview' }
      })
    }

    return {
      content,
      suggestions,
      actions,
      confidence: 0.85 + Math.random() * 0.1,
    }
  },

  // Create new conversation
  async createConversation(title: string, userId?: string): Promise<ConversationContext> {
    const conversation: ConversationContext = {
      id: this.generateConversationId(),
      userId,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Save to local storage for now
    this.saveConversationToStorage(conversation)
    
    return conversation
  },

  // Get conversation by ID
  async getConversation(conversationId: string): Promise<ConversationContext | null> {
    const conversations = this.getConversationsFromStorage()
    return conversations.find(c => c.id === conversationId) || null
  },

  // Get user conversations
  async getUserConversations(userId: string): Promise<ConversationContext[]> {
    const conversations = this.getConversationsFromStorage()
    return conversations.filter(c => c.userId === userId)
  },

  // Save conversation
  async saveConversation(
    conversationId: string,
    userMessage: AssistantMessage,
    assistantMessage: AssistantMessage
  ): Promise<void> {
    const conversation = await this.getConversation(conversationId)
    if (conversation) {
      conversation.messages.push(userMessage, assistantMessage)
      conversation.updatedAt = Date.now()
      this.saveConversationToStorage(conversation)
    }
  },

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<void> {
    const conversations = this.getConversationsFromStorage()
    const filtered = conversations.filter(c => c.id !== conversationId)
    localStorage.setItem('assistant_conversations', JSON.stringify(filtered))
  },

  // Stream response (for real-time updates)
  async *streamResponse(input: MultimodalInput, context?: ConversationContext): AsyncGenerator<string> {
    const response = await this.getAIResponse(await this.processMultimodalInput(input), context)
    
    // Simulate streaming by yielding words
    const words = response.content.split(' ')
    for (const word of words) {
      yield word + ' '
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
    }
  },

  // Utility methods
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  async uploadFile(file: File): Promise<string> {
    // Simulate file upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://example.com/uploads/${file.name}`)
      }, 500)
    })
  },

  async analyzeImage(image: File): Promise<string> {
    // Simulate image analysis
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('A document or image containing text content')
      }, 1000)
    })
  },

  async extractDocumentText(document: File): Promise<string> {
    // Simulate document text extraction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Extracted text content from the uploaded document')
      }, 1500)
    })
  },

  async transcribeAudio(audio: File): Promise<string> {
    // Simulate audio transcription
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Transcribed audio content from the uploaded file')
      }, 2000)
    })
  },

  saveConversationToStorage(conversation: ConversationContext): void {
    try {
      const conversations = this.getConversationsFromStorage()
      const existingIndex = conversations.findIndex(c => c.id === conversation.id)
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation
      } else {
        conversations.push(conversation)
      }
      
      localStorage.setItem('assistant_conversations', JSON.stringify(conversations))
    } catch (error) {
      console.error('Failed to save conversation to storage:', error)
    }
  },

  getConversationsFromStorage(): ConversationContext[] {
    try {
      const stored = localStorage.getItem('assistant_conversations')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get conversations from storage:', error)
      return []
    }
  },
}

// WebSocket connection for real-time assistant updates
export class AssistantWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(private url: string, private onMessage?: (data: any) => void) {}

  connect() {
    try {
      this.ws = new WebSocket(this.url)
      
      this.ws.onopen = () => {
        console.log('Assistant WebSocket connected')
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (this.onMessage) {
            this.onMessage(data)
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      this.ws.onclose = () => {
        console.log('Assistant WebSocket disconnected')
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('Assistant WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }
}
