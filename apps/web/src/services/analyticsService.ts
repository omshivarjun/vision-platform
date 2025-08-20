import { toastSuccess, toastError } from '../utils/toast'

// Types for analytics data
export interface AnalyticsEvent {
  id: string
  type: string
  userId?: string
  sessionId?: string
  timestamp: string
  properties: Record<string, any>
  metadata?: {
    userAgent: string
    ip?: string
    referrer?: string
  }
}

export interface RealTimeData {
  activeUsers: number
  eventsPerMinute: number
  systemMetrics: {
    cpu: number
    memory: number
    responseTime: number
  }
  topEvents: Array<{
    type: string
    count: number
  }>
  recentActivity: AnalyticsEvent[]
}

export interface HistoricalMetric {
  timestamp: string
  value: number
  metadata?: Record<string, any>
}

export interface UserAnalytics {
  totalSessions: number
  avgSessionDuration: number
  featureUsage: Record<string, number>
  lastActive: string
  preferences: Record<string, any>
}

export interface AnalyticsSummary {
  totalEvents: number
  uniqueUsers: number
  topFeatures: Array<{
    name: string
    count: number
    percentage: number
  }>
  timeRange: string
  lastUpdated: string
}

// Analytics Service Configuration
const ANALYTICS_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  maxRetries: 3,
  enableOfflineMode: true,
  enableDebugMode: import.meta.env.DEV
}

// Event queue for batching
let eventQueue: AnalyticsEvent[] = []
let flushTimer: NodeJS.Timeout | null = null

// Generate unique IDs
const generateId = () => `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// Get user ID from storage or auth context
const getUserId = (): string | undefined => {
  return localStorage.getItem('userId') || undefined
}

// Flush events to the server
const flushEvents = async () => {
  if (eventQueue.length === 0) return

  const eventsToSend = [...eventQueue]
  eventQueue = []

  try {
    const response = await fetch(`${ANALYTICS_CONFIG.apiBaseUrl}/analytics/events/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ events: eventsToSend })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    if (ANALYTICS_CONFIG.enableDebugMode) {
      console.log(`✅ Analytics: Flushed ${eventsToSend.length} events`)
    }
    
    // Clear the timer since we've successfully flushed
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
  } catch (error) {
    console.error('❌ Analytics: Failed to flush events:', error)
    
    // Re-queue events for retry (with limit)
    if (eventQueue.length < ANALYTICS_CONFIG.batchSize * 2) {
      eventQueue.unshift(...eventsToSend)
    }
  }
}

// Schedule event flushing
const scheduleFlush = () => {
  if (flushTimer) {
    clearTimeout(flushTimer)
  }
  flushTimer = setTimeout(flushEvents, ANALYTICS_CONFIG.flushInterval)
}

// Enhanced Analytics Service
export const analyticsService = {
  /**
   * Track a custom analytics event
   */
  trackEvent(
    eventType: string, 
    properties: Record<string, any> = {}, 
    userId?: string,
    sessionId?: string
  ) {
    const event: AnalyticsEvent = {
      id: generateId(),
      type: eventType,
      userId: userId || getUserId(),
      sessionId: sessionId || getSessionId(),
      timestamp: new Date().toISOString(),
      properties,
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined
      }
    }

    // Add to queue
    eventQueue.push(event)
    
    // Schedule flush if not already scheduled
    if (eventQueue.length >= ANALYTICS_CONFIG.batchSize) {
      flushEvents()
    } else {
      scheduleFlush()
    }

    if (ANALYTICS_CONFIG.enableDebugMode) {
      console.log('📊 Analytics Event:', event)
    }

    return event.id
  },

  /**
   * Track page view
   */
  trackPageView(pageName: string, properties: Record<string, any> = {}) {
    return this.trackEvent('page_view', {
      page_name: pageName,
      page_url: window.location.href,
      page_title: document.title,
      ...properties
    })
  },

  /**
   * Track user action
   */
  trackUserAction(action: string, properties: Record<string, any> = {}) {
    return this.trackEvent('user_action', {
      action,
      ...properties
    })
  },

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, properties: Record<string, any> = {}) {
    return this.trackEvent('feature_usage', {
      feature,
      ...properties
    })
  },

  /**
   * Track error
   */
  trackError(errorType: string, error: Error, properties: Record<string, any> = {}) {
    return this.trackEvent('error', {
      error_type: errorType,
      error_message: error.message,
      error_stack: error.stack,
      ...properties
    })
  },

  /**
   * Track conversion/funnel step
   */
  trackConversion(funnelStep: string, value?: number, properties: Record<string, any> = {}) {
    return this.trackEvent('conversion', {
      funnel_step: funnelStep,
      value,
      ...properties
    })
  },

  /**
   * Get real-time analytics data
   */
  async getRealTimeData(): Promise<RealTimeData> {
    try {
      const response = await fetch(`${ANALYTICS_CONFIG.apiBaseUrl}/analytics/realtime`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch real-time data:', error)
      
      // Return mock data for development
      if (ANALYTICS_CONFIG.enableDebugMode) {
        return {
          activeUsers: Math.floor(Math.random() * 100) + 50,
          eventsPerMinute: Math.floor(Math.random() * 20) + 10,
          systemMetrics: {
            cpu: Math.random() * 30 + 20,
            memory: Math.random() * 40 + 30,
            responseTime: Math.random() * 50 + 20
          },
          topEvents: [
            { type: 'page_view', count: Math.floor(Math.random() * 100) + 50 },
            { type: 'translation', count: Math.floor(Math.random() * 80) + 30 },
            { type: 'document_processing', count: Math.floor(Math.random() * 60) + 20 },
            { type: 'ai_assistant_usage', count: Math.floor(Math.random() * 40) + 15 }
          ],
          recentActivity: []
        }
      }
      
      throw error
    }
  },

  /**
   * Get historical metrics
   */
  async getHistoricalMetrics(
    metric: string, 
    timeRange: string, 
    interval: string
  ): Promise<HistoricalMetric[]> {
    try {
      const response = await fetch(
        `${ANALYTICS_CONFIG.apiBaseUrl}/analytics/metrics?metric=${metric}&timeRange=${timeRange}&interval=${interval}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch historical metrics:', error)
      
      // Return mock data for development
      if (ANALYTICS_CONFIG.enableDebugMode) {
        const now = new Date()
        const mockData: HistoricalMetric[] = []
        
        for (let i = 23; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
          mockData.push({
            timestamp: timestamp.toISOString(),
            value: Math.floor(Math.random() * 100) + 20
          })
        }
        
        return mockData
      }
      
      throw error
    }
  },

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string, timeRange: string): Promise<UserAnalytics> {
    try {
      const response = await fetch(
        `${ANALYTICS_CONFIG.apiBaseUrl}/analytics/user/${userId}?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch user analytics:', error)
      
      // Return mock data for development
      if (ANALYTICS_CONFIG.enableDebugMode) {
        return {
          totalSessions: Math.floor(Math.random() * 20) + 5,
          avgSessionDuration: Math.floor(Math.random() * 30) + 10,
          featureUsage: {
            translation: Math.floor(Math.random() * 50) + 20,
            document_processing: Math.floor(Math.random() * 30) + 10,
            ai_assistant: Math.floor(Math.random() * 20) + 5
          },
          lastActive: new Date().toISOString(),
          preferences: {
            language: 'en',
            theme: 'light'
          }
        }
      }
      
      throw error
    }
  },

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(timeRange: string): Promise<AnalyticsSummary> {
    try {
      const response = await fetch(
        `${ANALYTICS_CONFIG.apiBaseUrl}/analytics/summary?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch analytics summary:', error)
      
      // Return mock data for development
      if (ANALYTICS_CONFIG.enableDebugMode) {
        return {
          totalEvents: Math.floor(Math.random() * 10000) + 5000,
          uniqueUsers: Math.floor(Math.random() * 500) + 200,
          topFeatures: [
            { name: 'Translation', count: Math.floor(Math.random() * 5000) + 2000, percentage: 45 },
            { name: 'Document Processing', count: Math.floor(Math.random() * 3000) + 1500, percentage: 30 },
            { name: 'AI Assistant', count: Math.floor(Math.random() * 2000) + 1000, percentage: 25 }
          ],
          timeRange,
          lastUpdated: new Date().toISOString()
        }
      }
      
      throw error
    }
  },

  /**
   * Export analytics data
   */
  async exportAnalytics(timeRange: string, format: 'csv' | 'json'): Promise<void> {
    try {
      const response = await fetch(
        `${ANALYTICS_CONFIG.apiBaseUrl}/analytics/export?timeRange=${timeRange}&format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      }

      toastSuccess(`Analytics data exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Failed to export analytics:', error)
      toastError('Failed to export analytics data')
      throw error
    }
  },

  /**
   * Flush pending events immediately
   */
  async flushEvents(): Promise<void> {
    await flushEvents()
  },

  /**
   * Get service status
   */
  getStatus() {
    return {
      queueSize: eventQueue.length,
      isOnline: navigator.onLine,
      config: ANALYTICS_CONFIG,
      sessionId: getSessionId(),
      userId: getUserId()
    }
  },

  /**
   * Clear event queue (for testing)
   */
  clearQueue() {
    eventQueue = []
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
  }
}

// Legacy compatibility
export const track = analyticsService.trackEvent



// Export for use in other modules
export default analyticsService

// Browser-specific event listeners (only run in browser environment)
if (typeof window !== 'undefined') {
  // Auto-flush on page unload
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery on page unload
      const data = JSON.stringify({ events: eventQueue })
      navigator.sendBeacon(`${ANALYTICS_CONFIG.apiBaseUrl}/analytics/events/batch`, data)
    }
  })

  // Handle online/offline status
  window.addEventListener('online', () => {
    if (eventQueue.length > 0) {
      flushEvents()
    }
  })
}
