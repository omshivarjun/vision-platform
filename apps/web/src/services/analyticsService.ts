// Extend Window interface for analytics event emitter
declare global {
  interface Window {
    analyticsEventEmitter?: {
      emit: (event: string, data: any) => void
    }
  }
}

// Real-time analytics service for tracking user events and metrics
export interface AnalyticsEvent {
  id: string
  type: string
  userId?: string
  anonymousId?: string
  timestamp: number
  properties: Record<string, any>
  sessionId?: string
  pageUrl?: string
  userAgent?: string
}

export interface AnalyticsMetric {
  name: string
  value: number
  timestamp: number
  tags: Record<string, string>
}

export interface RealTimeData {
  activeUsers: number
  eventsPerMinute: number
  topEvents: Array<{ type: string; count: number }>
  recentActivity: AnalyticsEvent[]
  systemMetrics: {
    cpu: number
    memory: number
    responseTime: number
    errorRate: number
  }
}

// Analytics service
export const analyticsService = {
  // Track user event
  async trackEvent(eventType: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: eventType,
      userId: this.getUserId(),
      anonymousId: this.getAnonymousId(),
      timestamp: Date.now(),
      properties,
      sessionId: this.getSessionId(),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    }

    try {
      // Send to backend
      await this.sendEvent(event)
      
      // Store locally for offline sync
      this.storeEventLocally(event)
      
      // Emit to real-time listeners
      this.emitEvent(event)
      
      console.log('Event tracked:', event)
    } catch (error) {
      console.error('Failed to track event:', error)
      // Queue for retry
      this.queueEventForRetry(event)
    }
  },

  // Track page view
  trackPageView(pageName: string, properties: Record<string, any> = {}) {
    this.trackEvent('page_view', {
      page_name: pageName,
      page_url: window.location.href,
      referrer: document.referrer,
      ...properties,
    })
  },

  // Track user action
  trackUserAction(action: string, properties: Record<string, any> = {}) {
    this.trackEvent('user_action', {
      action,
      ...properties,
    })
  },

  // Track translation
  trackTranslation(sourceLanguage: string, targetLanguage: string, properties: Record<string, any> = {}) {
    this.trackEvent('translation', {
      source_language: sourceLanguage,
      target_language: targetLanguage,
      ...properties,
    })
  },

  // Track payment
  trackPayment(amount: number, currency: string, plan: string, properties: Record<string, any> = {}) {
    this.trackEvent('payment', {
      amount,
      currency,
      plan,
      ...properties,
    })
  },

  // Track document processing
  trackDocumentProcessing(fileType: string, fileSize: number, processingTime: number, properties: Record<string, any> = {}) {
    this.trackEvent('document_processing', {
      file_type: fileType,
      file_size: fileSize,
      processing_time: processingTime,
      ...properties,
    })
  },

  // Track AI assistant usage
  trackAIAssistantUsage(queryType: string, responseTime: number, properties: Record<string, any> = {}) {
    this.trackEvent('ai_assistant_usage', {
      query_type: queryType,
      response_time: responseTime,
      ...properties,
    })
  },

  // Track error
  trackError(error: Error, context: Record<string, any> = {}) {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    })
  },

  // Get real-time data
  async getRealTimeData(): Promise<RealTimeData> {
    try {
      const response = await fetch('/api/analytics/realtime')
      
      if (!response.ok) {
        throw new Error('Failed to fetch real-time data')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch real-time data:', error)
      
      // Return mock data for development
      return this.getMockRealTimeData()
    }
  },

  // Get historical metrics
  async getHistoricalMetrics(metric: string, timeRange: string, interval: string) {
    try {
      const response = await fetch(`/api/analytics/metrics/${metric}?range=${timeRange}&interval=${interval}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical metrics')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch historical metrics:', error)
      return []
    }
  },

  // Get user analytics
  async getUserAnalytics(userId: string, timeRange: string = '30d') {
    try {
      const response = await fetch(`/api/analytics/users/${userId}?range=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch user analytics')
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to fetch user analytics:', error)
      return null
    }
  },

  // Export analytics data
  async exportAnalytics(timeRange: string, format: 'csv' | 'json' = 'csv') {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeRange, format }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to export analytics')
      }

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${timeRange}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to export analytics:', error)
      throw error
    }
  },

  // Helper methods
  generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  getUserId(): string | undefined {
    // Get from auth context or localStorage
    return localStorage.getItem('userId') || undefined
  },

  getAnonymousId(): string {
    let anonymousId = localStorage.getItem('anonymousId')
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('anonymousId', anonymousId)
    }
    return anonymousId
  },

  getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  },

  async sendEvent(event: AnalyticsEvent): Promise<void> {
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error('Failed to send analytics event')
    }
  },

  storeEventLocally(event: AnalyticsEvent): void {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
      events.push(event)
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100)
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events))
    } catch (error) {
      console.error('Failed to store event locally:', error)
    }
  },

  emitEvent(event: AnalyticsEvent): void {
    // Emit to WebSocket or EventSource listeners
    if (window.analyticsEventEmitter) {
      window.analyticsEventEmitter.emit('event', event)
    }
  },

  queueEventForRetry(event: AnalyticsEvent): void {
    try {
      const retryQueue = JSON.parse(localStorage.getItem('analytics_retry_queue') || '[]')
      retryQueue.push(event)
      localStorage.setItem('analytics_retry_queue', JSON.stringify(retryQueue))
    } catch (error) {
      console.error('Failed to queue event for retry:', error)
    }
  },

  getMockRealTimeData(): RealTimeData {
    return {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      eventsPerMinute: Math.floor(Math.random() * 20) + 5,
      topEvents: [
        { type: 'page_view', count: Math.floor(Math.random() * 100) + 50 },
        { type: 'translation', count: Math.floor(Math.random() * 50) + 20 },
        { type: 'document_processing', count: Math.floor(Math.random() * 30) + 10 },
        { type: 'ai_assistant_usage', count: Math.floor(Math.random() * 40) + 15 },
      ],
      recentActivity: [
        {
          id: 'evt_1',
          type: 'page_view',
          timestamp: Date.now() - 30000,
          properties: { page_name: 'Translation Page' },
        } as AnalyticsEvent,
        {
          id: 'evt_2',
          type: 'translation',
          timestamp: Date.now() - 60000,
          properties: { source_language: 'en', target_language: 'es' },
        } as AnalyticsEvent,
      ],
      systemMetrics: {
        cpu: Math.random() * 30 + 20,
        memory: Math.random() * 20 + 60,
        responseTime: Math.random() * 100 + 50,
        errorRate: Math.random() * 2,
      },
    }
  },
}

// WebSocket connection for real-time updates
export class AnalyticsWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(private url: string, private onMessage?: (data: any) => void) {}

  connect() {
    try {
      this.ws = new WebSocket(this.url)
      
      this.ws.onopen = () => {
        console.log('Analytics WebSocket connected')
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
        console.log('Analytics WebSocket disconnected')
        this.attemptReconnect()
      }
      
      this.ws.onerror = (error) => {
        console.error('Analytics WebSocket error:', error)
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

// Event emitter for real-time updates
export class AnalyticsEventEmitter {
  private listeners: Map<string, Set<Function>> = new Map()

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback)
    }
  }

  emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    }
  }

  removeAllListeners(event?: string) {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// Initialize global event emitter
if (typeof window !== 'undefined') {
  (window as any).analyticsEventEmitter = new AnalyticsEventEmitter()
}
