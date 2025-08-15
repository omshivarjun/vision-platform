import { toast } from 'react-hot-toast'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const API_TIMEOUT = 30000 // 30 seconds

// API response types
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface ApiError {
  message: string
  status: number
  code?: string
}

// HTTP client with timeout and error handling
class ApiClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        throw error
      }
      throw new Error('Unknown error occurred')
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Upload timeout')
        }
        throw error
      }
      throw new Error('Upload failed')
    }
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT)

// Payment API
export const paymentApi = {
  // Stripe integration
  async createCheckoutSession(data: {
    priceId: string
    successUrl: string
    cancelUrl: string
    customerEmail?: string
  }) {
    return apiClient.post<{ sessionId: string; url: string }>('/payments/create-checkout-session', data)
  },

  async createPaymentIntent(data: {
    amount: number
    currency: string
    customerId?: string
    metadata?: Record<string, string>
  }) {
    return apiClient.post<{ clientSecret: string; paymentIntentId: string }>('/payments/create-payment-intent', data)
  },

  async confirmPaymentIntent(paymentIntentId: string) {
    return apiClient.post<{ status: string }>(`/payments/confirm-payment-intent/${paymentIntentId}`)
  },

  async getPaymentIntent(paymentIntentId: string) {
    return apiClient.get<{ status: string; amount: number; currency: string }>(`/payments/payment-intent/${paymentIntentId}`)
  },

  // Subscription management
  async getSubscriptionPlans() {
    return apiClient.get<Array<{
      id: string
      name: string
      price: number
      currency: string
      interval: string
      features: string[]
    }>>('/subscriptions/plans')
  },

  async createSubscription(data: {
    planId: string
    customerEmail: string
    paymentMethodId?: string
  }) {
    return apiClient.post<{ subscriptionId: string; status: string }>('/subscriptions/create', data)
  },

  async cancelSubscription(subscriptionId: string) {
    return apiClient.post<{ status: string }>(`/subscriptions/${subscriptionId}/cancel`)
  },

  // Customer management
  async getCustomer(customerId: string) {
    return apiClient.get<{
      id: string
      email: string
      name?: string
      subscription?: any
    }>(`/customers/${customerId}`)
  },

  async createCustomer(data: { email: string; name?: string }) {
    return apiClient.post<{ customerId: string }>('/customers/create', data)
  },

  // Billing portal
  async getBillingPortalUrl(customerId: string) {
    return apiClient.post<{ url: string }>('/customers/billing-portal', { customerId })
  },
}

// Document processing API
export const documentApi = {
  async uploadDocument(file: File, options?: {
    language?: string
    extractText?: boolean
    extractStructure?: boolean
  }) {
    const formData = new FormData()
    formData.append('file', file)
    if (options?.language) formData.append('language', options.language)
    if (options?.extractText !== undefined) formData.append('extractText', options.extractText.toString())
    if (options?.extractStructure !== undefined) formData.append('extractStructure', options.extractStructure.toString())

    return apiClient.upload<{
      documentId: string
      status: string
      text?: string
      structure?: any
      metadata: {
        fileName: string
        fileSize: number
        fileType: string
        language?: string
      }
    }>('/documents/upload', formData)
  },

  async processDocument(documentId: string, options?: {
    extractText?: boolean
    extractStructure?: boolean
    performOCR?: boolean
  }) {
    return apiClient.post<{
      status: string
      text?: string
      structure?: any
      ocrResults?: any
    }>(`/documents/${documentId}/process`, options)
  },

  async getDocument(documentId: string) {
    return apiClient.get<{
      id: string
      status: string
      text?: string
      structure?: any
      metadata: any
      createdAt: string
    }>(`/documents/${documentId}`)
  },

  async getDocuments(filters?: {
    status?: string
    fileType?: string
    limit?: number
    offset?: number
  }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.fileType) params.append('fileType', filters.fileType)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())

    return apiClient.get<{
      documents: any[]
      total: number
      hasMore: boolean
    }>(`/documents?${params.toString()}`)
  },

  async deleteDocument(documentId: string) {
    return apiClient.delete<{ success: boolean }>(`/documents/${documentId}`)
  },
}

// AI Assistant API
export const assistantApi = {
  async sendMessage(data: {
    text: string
    images?: File[]
    documents?: File[]
    audio?: File
    context?: string
    language?: string
    conversationId?: string
  }) {
    const formData = new FormData()
    formData.append('text', data.text)
    if (data.context) formData.append('context', data.context)
    if (data.language) formData.append('language', data.language)
    if (data.conversationId) formData.append('conversationId', data.conversationId)

    if (data.images) {
      data.images.forEach((image, index) => {
        formData.append(`images`, image)
      })
    }

    if (data.documents) {
      data.documents.forEach((document, index) => {
        formData.append(`documents`, document)
      })
    }

    if (data.audio) {
      formData.append('audio', data.audio)
    }

    return apiClient.upload<{
      messageId: string
      content: string
      suggestions?: string[]
      actions?: Array<{
        type: string
        description: string
        parameters?: Record<string, any>
      }>
      confidence: number
      processingTime: number
    }>('/assistant/message', formData)
  },

  async getConversations(filters?: {
    limit?: number
    offset?: number
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())
    if (filters?.search) params.append('search', filters.search)

    return apiClient.get<{
      conversations: Array<{
        id: string
        title: string
        lastMessage: string
        messageCount: number
        createdAt: string
        updatedAt: string
      }>
      total: number
    }>(`/assistant/conversations?${params.toString()}`)
  },

  async getConversation(conversationId: string) {
    return apiClient.get<{
      id: string
      title: string
      messages: Array<{
        id: string
        role: 'user' | 'assistant'
        content: string
        timestamp: string
        metadata?: any
      }>
      metadata: any
      createdAt: string
      updatedAt: string
    }>(`/assistant/conversations/${conversationId}`)
  },

  async deleteConversation(conversationId: string) {
    return apiClient.delete<{ success: boolean }>(`/assistant/conversations/${conversationId}`)
  },

  async streamMessage(data: {
    text: string
    images?: File[]
    documents?: File[]
    audio?: File
    context?: string
    language?: string
    conversationId?: string
  }, onChunk: (chunk: string) => void) {
    const formData = new FormData()
    formData.append('text', data.text)
    if (data.context) formData.append('context', data.context)
    if (data.language) formData.append('language', data.language)
    if (data.conversationId) formData.append('conversationId', data.conversationId)

    if (data.images) {
      data.images.forEach((image) => {
        formData.append('images', image)
      })
    }

    if (data.documents) {
      data.documents.forEach((document) => {
        formData.append('documents', document)
      })
    }

    if (data.audio) {
      formData.append('audio', data.audio)
    }

    const url = `${API_BASE_URL}/assistant/stream`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') return
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                onChunk(parsed.content)
              }
            } catch (e) {
              // Ignore parsing errors for malformed chunks
            }
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Stream timeout')
        }
        throw error
      }
      throw new Error('Stream failed')
    }
  },
}

// Analytics API
export const analyticsApi = {
  async trackEvent(event: {
    name: string
    properties?: Record<string, any>
    userId?: string
    sessionId?: string
  }) {
    return apiClient.post<{ success: boolean }>('/analytics/events', event)
  },

  async getRealTimeData() {
    return apiClient.get<{
      activeUsers: number
      pageViews: number
      events: Array<{
        name: string
        count: number
        timestamp: string
      }>
      topPages: Array<{
        path: string
        views: number
      }>
    }>('/analytics/realtime')
  },

  async getHistoricalMetrics(metric: string, timeRange: string, interval: string) {
    const params = new URLSearchParams({
      metric,
      timeRange,
      interval,
    })

    return apiClient.get<{
      data: Array<{
        timestamp: string
        value: number
      }>
      summary: {
        total: number
        average: number
        min: number
        max: number
      }
    }>(`/analytics/metrics?${params.toString()}`)
  },

  async getUserAnalytics(userId: string, timeRange: string) {
    const params = new URLSearchParams({
      timeRange,
    })

    return apiClient.get<{
      userId: string
      pageViews: number
      events: number
      sessions: number
      averageSessionDuration: number
      topActions: Array<{
        action: string
        count: number
      }>
    }>(`/analytics/users/${userId}?${params.toString()}`)
  },

  async exportData(format: 'csv' | 'json', filters?: {
    startDate?: string
    endDate?: string
    metrics?: string[]
  }) {
    const params = new URLSearchParams({ format })
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.metrics) filters.metrics.forEach(m => params.append('metrics', m))

    return apiClient.get<{ downloadUrl: string }>(`/analytics/export?${params.toString()}`)
  },
}

// Translation API
export const translationApi = {
  async translateText(data: {
    text: string
    sourceLanguage: string
    targetLanguage: string
    context?: string
  }) {
    return apiClient.post<{
      translatedText: string
      confidence: number
      detectedLanguage?: string
      alternatives?: string[]
    }>('/translation/translate', data)
  },

  async detectLanguage(text: string) {
    return apiClient.post<{
      detectedLanguage: string
      confidence: number
      alternatives: Array<{
        language: string
        confidence: number
      }>
    }>('/translation/detect', { text })
  },

  async getSupportedLanguages() {
    return apiClient.get<Array<{
      code: string
      name: string
      nativeName: string
      supportsTranslation: boolean
      supportsDetection: boolean
    }>>('/translation/languages')
  },

  async getTranslationMemory(userId: string, filters?: {
    sourceLanguage?: string
    targetLanguage?: string
    limit?: number
    offset?: number
  }) {
    const params = new URLSearchParams()
    if (filters?.sourceLanguage) params.append('sourceLanguage', filters.sourceLanguage)
    if (filters?.targetLanguage) params.append('targetLanguage', filters.targetLanguage)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())

    return apiClient.get<{
      entries: Array<{
        id: string
        sourceText: string
        translatedText: string
        sourceLanguage: string
        targetLanguage: string
        createdAt: string
      }>
      total: number
    }>(`/translation/memory/${userId}?${params.toString()}`)
  },

  async addTranslationMemory(userId: string, data: {
    sourceText: string
    translatedText: string
    sourceLanguage: string
    targetLanguage: string
  }) {
    return apiClient.post<{ entryId: string }>('/translation/memory', {
      userId,
      ...data,
    })
  },

  async deleteTranslationMemory(entryId: string) {
    return apiClient.delete<{ success: boolean }>(`/translation/memory/${entryId}`)
  },

  async getHistory(userId: string, filters?: {
    sourceLanguage?: string
    targetLanguage?: string
    limit?: number
    offset?: number
  }) {
    const params = new URLSearchParams()
    if (filters?.sourceLanguage) params.append('sourceLanguage', filters.sourceLanguage)
    if (filters?.targetLanguage) params.append('targetLanguage', filters.targetLanguage)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.offset) params.append('offset', filters.offset.toString())

    return apiClient.get<{
      translations: Array<{
        id: string
        sourceText: string
        translatedText: string
        sourceLanguage: string
        targetLanguage: string
        timestamp: string
        isFavorite: boolean
      }>
      total: number
    }>(`/translation/history/${userId}?${params.toString()}`)
  },

  async deleteHistoryItem(itemId: string) {
    return apiClient.delete<{ success: boolean }>(`/translation/history/${itemId}`)
  },

  async favoriteHistoryItem(itemId: string, isFavorite: boolean) {
    return apiClient.put<{ success: boolean }>(`/translation/history/${itemId}/favorite`, { isFavorite })
  },
}

// OCR API
export const ocrApi = {
  async extractText(image: File, options?: {
    language?: string
    confidence?: number
  }) {
    const formData = new FormData()
    formData.append('image', image)
    if (options?.language) formData.append('language', options.language)
    if (options?.confidence) formData.append('confidence', options.confidence.toString())

    return apiClient.upload<{
      text: string
      confidence: number
      language: string
      regions: Array<{
        text: string
        confidence: number
        boundingBox: [number, number, number, number]
      }>
    }>('/ocr/extract', formData)
  },

  async batchExtract(images: File[], options?: {
    language?: string
    confidence?: number
  }) {
    const formData = new FormData()
    images.forEach((image, index) => {
      formData.append('images', image)
    })
    if (options?.language) formData.append('language', options.language)
    if (options?.confidence) formData.append('confidence', options.confidence.toString())

    return apiClient.upload<Array<{
      imageId: string
      text: string
      confidence: number
      language: string
      regions: Array<{
        text: string
        confidence: number
        boundingBox: [number, number, number, number]
      }>
    }>>('/ocr/batch-extract', formData)
  },
}

// Accessibility API
export const accessibilityApi = {
  async analyzeScene(image: File, options?: {
    includeObjects?: boolean
    includeText?: boolean
    includeColors?: boolean
  }) {
    const formData = new FormData()
    formData.append('image', image)
    if (options?.includeObjects !== undefined) formData.append('includeObjects', options.includeObjects.toString())
    if (options?.includeText !== undefined) formData.append('includeText', options.includeText.toString())
    if (options?.includeColors !== undefined) formData.append('includeColors', options.includeColors.toString())

    return apiClient.upload<{
      description: string
      objects: Array<{
        name: string
        confidence: number
        boundingBox: [number, number, number, number]
      }>
      colors: Array<{
        color: string
        percentage: number
      }>
      accessibility: {
        hasText: boolean
        hasHighContrast: boolean
        isColorBlindFriendly: boolean
        recommendations: string[]
      }
    }>('/accessibility/analyze-scene', formData)
  },

  async detectObjects(image: File, options?: {
    confidence?: number
    maxObjects?: number
  }) {
    const formData = new FormData()
    formData.append('image', image)
    if (options?.confidence) formData.append('confidence', options.confidence.toString())
    if (options?.maxObjects) formData.append('maxObjects', options.maxObjects.toString())

    return apiClient.upload<{
      objects: Array<{
        name: string
        confidence: number
        boundingBox: [number, number, number, number]
        attributes?: Record<string, any>
      }>
      totalObjects: number
    }>('/accessibility/detect-objects', formData)
  },
}

// All APIs are already exported individually above
