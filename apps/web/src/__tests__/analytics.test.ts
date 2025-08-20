import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { analyticsService, AnalyticsEvent } from '../services/analyticsService'
import { useAnalytics } from '../hooks/useAnalytics'
import React from 'react'

// Test wrapper for React hooks
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement('div', {}, children)
}

const renderHookWithWrapper = <TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: any
) => {
  return renderHook(hook, { wrapper: TestWrapper, ...options })
}

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    analyticsService.clearQueue()
    ;(localStorage.getItem as any).mockReturnValue(null)
    ;(localStorage.setItem as any).mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Event Tracking', () => {
    it('should track custom events', () => {
      const eventId = analyticsService.trackEvent('test_event', { test: 'data' })
      expect(eventId).toBeDefined()
      expect(eventId).toMatch(/^evt_\d+_[a-z0-9]+$/)
    })

    it('should track page views', () => {
      const eventId = analyticsService.trackPageView('Test Page', { user_role: 'admin' })
      expect(eventId).toBeDefined()
    })

    it('should track user actions', () => {
      const eventId = analyticsService.trackUserAction('button_click', { button: 'submit' })
      expect(eventId).toBeDefined()
    })

    it('should track feature usage', () => {
      const eventId = analyticsService.trackFeatureUsage('translation', { language: 'en' })
      expect(eventId).toBeDefined()
    })

    it('should track errors', () => {
      const error = new Error('Test error')
      const eventId = analyticsService.trackError('api_error', error, { endpoint: '/test' })
      expect(eventId).toBeDefined()
    })

    it('should track conversions', () => {
      const eventId = analyticsService.trackConversion('signup_complete', 100, { plan: 'pro' })
      expect(eventId).toBeDefined()
    })
  })

  describe('Event Batching', () => {
    it('should batch events and flush after interval', async () => {
      vi.useFakeTimers()
      
      // Mock fetch to return success
      const mockFetch = vi.fn().mockResolvedValue({ ok: true })
      global.fetch = mockFetch
      
      // Track multiple events
      analyticsService.trackEvent('event1', {})
      analyticsService.trackEvent('event2', {})
      analyticsService.trackEvent('event3', {})
      
      expect(analyticsService.getStatus().queueSize).toBe(3)
      
      // Fast forward time to trigger flush
      vi.advanceTimersByTime(6000)
      
      // Wait for async operations
      await vi.runAllTimersAsync()
      
      // Events should be flushed
      expect(analyticsService.getStatus().queueSize).toBe(0)
      
      vi.useRealTimers()
    })

    it('should flush immediately when batch size is reached', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true })
      global.fetch = mockFetch
      
      // Track events up to batch size (10)
      for (let i = 0; i < 10; i++) {
        analyticsService.trackEvent(`event_${i}`, {})
      }
      
      // Should flush immediately
      expect(mockFetch).toHaveBeenCalled()
      expect(analyticsService.getStatus().queueSize).toBe(0)
    })
  })

  describe('API Integration', () => {
    it('should send events to analytics endpoint', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true })
      global.fetch = mockFetch
      
      analyticsService.trackEvent('test_event', { test: 'data' })
      
      // Wait for flush
      await analyticsService.flushEvents()
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/analytics/events/batch'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('test_event')
        })
      )
    })

    it('should handle API errors gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetch
      
      analyticsService.trackEvent('test_event', {})
      
      // Should not throw error
      await expect(analyticsService.flushEvents()).resolves.not.toThrow()
    })

    it('should retry failed events', async () => {
      const mockFetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true })
      global.fetch = mockFetch
      
      analyticsService.trackEvent('test_event', {})
      
      // First flush should fail
      await analyticsService.flushEvents()
      expect(analyticsService.getStatus().queueSize).toBe(1)
      
      // Second flush should succeed
      await analyticsService.flushEvents()
      expect(analyticsService.getStatus().queueSize).toBe(0)
    })
  })

  describe('Session Management', () => {
    it('should generate and persist session ID', () => {
      analyticsService.trackEvent('test_event', {})
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'analytics_session_id',
        expect.stringMatching(/^sess_\d+_[a-z0-9]+$/)
      )
    })

    it('should reuse existing session ID', () => {
      const existingSessionId = 'sess_1234567890_abc123'
      ;(localStorage.getItem as any).mockReturnValue(existingSessionId)
      
      analyticsService.trackEvent('test_event', {})
      
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('should include user ID when available', () => {
      const userId = 'user_123'
      ;(localStorage.getItem as any).mockReturnValue(userId)
      
      const eventId = analyticsService.trackEvent('test_event', {})
      expect(eventId).toBeDefined()
    })
  })

  describe('Data Retrieval', () => {
    it('should fetch real-time data', async () => {
      const mockData = {
        activeUsers: 50,
        eventsPerMinute: 10,
        systemMetrics: { cpu: 25, memory: 60, responseTime: 30 },
        topEvents: [],
        recentActivity: []
      }
      
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
      global.fetch = mockFetch
      
      const result = await analyticsService.getRealTimeData()
      expect(result).toEqual(mockData)
    })

    it('should fetch historical metrics', async () => {
      const mockData = [
        { timestamp: '2024-01-01T00:00:00Z', value: 100 },
        { timestamp: '2024-01-01T01:00:00Z', value: 150 }
      ]
      
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
      global.fetch = mockFetch
      
      const result = await analyticsService.getHistoricalMetrics('page_views', '7d', '1h')
      expect(result).toEqual(mockData)
    })

    it('should return mock data in development mode', async () => {
      // Simulate development mode
      const originalEnv = import.meta.env.DEV
      import.meta.env.DEV = true
      
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetch
      
      const result = await analyticsService.getRealTimeData()
      expect(result).toHaveProperty('activeUsers')
      expect(result).toHaveProperty('eventsPerMinute')
      expect(result).toHaveProperty('systemMetrics')
      
      // Restore original env
      import.meta.env.DEV = originalEnv
    })
  })

  describe('Export Functionality', () => {
    it('should export data as CSV', async () => {
      const mockBlob = new Blob(['test,csv,data'], { type: 'text/csv' })
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob)
      })
      global.fetch = mockFetch
      
      // Mock document.createElement and click
      const mockClick = vi.fn()
      const mockElement = {
        href: '',
        download: '',
        click: mockClick
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockElement as any)
      
      await analyticsService.exportAnalytics('7d', 'csv')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/analytics/export?timeRange=7d&format=csv'),
        expect.any(Object)
      )
      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('Service Status', () => {
    it('should return current service status', () => {
      analyticsService.trackEvent('test_event', {})
      
      const status = analyticsService.getStatus()
      expect(status).toHaveProperty('queueSize')
      expect(status).toHaveProperty('isOnline')
      expect(status).toHaveProperty('config')
      expect(status).toHaveProperty('sessionId')
      expect(status).toHaveProperty('userId')
    })

    it('should clear event queue', () => {
      analyticsService.trackEvent('test_event', {})
      expect(analyticsService.getStatus().queueSize).toBe(1)
      
      analyticsService.clearQueue()
      expect(analyticsService.getStatus().queueSize).toBe(0)
    })
  })
})

describe('useAnalytics Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    analyticsService.clearQueue()
  })

  it('should provide analytics methods', () => {
    const { result } = renderHookWithWrapper(() => useAnalytics())
    
    expect(result.current).toHaveProperty('trackEvent')
    expect(result.current).toHaveProperty('trackPageView')
    expect(result.current).toHaveProperty('trackUserAction')
    expect(result.current).toHaveProperty('trackFeatureUsage')
    expect(result.current).toHaveProperty('trackError')
    expect(result.current).toHaveProperty('trackConversion')
  })

  it('should track session start on mount', () => {
    const mockTrackEvent = vi.spyOn(analyticsService, 'trackEvent')
    
    renderHookWithWrapper(() => useAnalytics())
    
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'session_start',
      expect.objectContaining({
        session_duration: 0,
        referrer: 'https://example.com',
        user_agent: 'test-user-agent'
      })
    )
  })

  it('should track session end on unmount', () => {
    const mockTrackEvent = vi.spyOn(analyticsService, 'trackEvent')
    
    const { unmount } = renderHookWithWrapper(() => useAnalytics())
    unmount()
    
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'session_end',
      expect.objectContaining({
        session_duration: expect.any(Number),
        total_events: expect.any(Number)
      })
    )
  })

  it('should track user activity', async () => {
    const mockTrackEvent = vi.spyOn(analyticsService, 'trackEvent')
    
    renderHookWithWrapper(() => useAnalytics())
    
    // Simulate user activity
    const clickEvent = new Event('click')
    document.dispatchEvent(clickEvent)
    
    // Wait for activity tracking
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'user_activity',
      expect.objectContaining({
        time_since_last_activity: expect.any(Number),
        activity_type: 'user_interaction'
      })
    )
  })

  it('should track page visibility changes', () => {
    const mockTrackEvent = vi.spyOn(analyticsService, 'trackEvent')
    
    renderHookWithWrapper(() => useAnalytics())
    
    // Simulate page hidden
    Object.defineProperty(document, 'hidden', { value: true, writable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'page_hidden',
      expect.objectContaining({
        timestamp: expect.any(String)
      })
    )
    
    // Simulate page visible
    Object.defineProperty(document, 'hidden', { value: false, writable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'page_visible',
      expect.objectContaining({
        timestamp: expect.any(String),
        time_hidden: expect.any(Number)
      })
    )
  })

  it('should track performance metrics', () => {
    const mockTrackEvent = vi.spyOn(analyticsService, 'trackEvent')
    
    renderHookWithWrapper(() => useAnalytics())
    
    // Simulate performance observer
    const mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn()
    }
    ;(window.performance as any).observer = vi.fn(() => mockObserver)
    
    expect(mockObserver.observe).toHaveBeenCalledWith({ entryTypes: ['navigation'] })
  })

  it('should provide feature-specific tracking methods', () => {
    const { result } = renderHookWithWrapper(() => useAnalytics())
    
    expect(result.current).toHaveProperty('trackTranslation')
    expect(result.current).toHaveProperty('trackDocumentProcessing')
    expect(result.current).toHaveProperty('trackAIUsage')
    expect(result.current).toHaveProperty('trackPayment')
    expect(result.current).toHaveProperty('trackSearch')
    expect(result.current).toHaveProperty('trackDownload')
    expect(result.current).toHaveProperty('trackUpload')
    expect(result.current).toHaveProperty('trackFormSubmission')
    expect(result.current).toHaveProperty('trackButtonClick')
    expect(result.current).toHaveProperty('trackNavigation')
    expect(result.current).toHaveProperty('trackMediaInteraction')
    expect(result.current).toHaveProperty('trackAccessibility')
  })

  it('should track translation events', () => {
    const mockTrackEvent = vi.spyOn(analyticsService, 'trackEvent')
    const { result } = renderHookWithWrapper(() => useAnalytics())
    
    result.current.trackTranslation('en', 'es', { text_length: 100 })
    
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'translation_request',
      expect.objectContaining({
        source_language: 'en',
        target_language: 'es',
        text_length: 100
      })
    )
  })

  it('should track document processing events', () => {
    const mockTrackEvent = vi.spyOn(analyticsService, 'trackEvent')
    const { result } = renderHookWithWrapper(() => useAnalytics())
    
    result.current.trackDocumentProcessing('pdf', 1500, { pages: 5 })
    
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'document_processing',
      expect.objectContaining({
        document_type: 'pdf',
        processing_time: 1500,
        pages: 5
      })
    )
  })

  it('should track AI usage events', () => {
    const mockTrackEvent = vi.spyOn(analyticsService, 'trackEvent')
    const { result } = renderHookWithWrapper(() => useAnalytics())
    
    result.current.trackAIUsage('text_generation', 2500, { model: 'gpt-4' })
    
    expect(mockTrackEvent).toHaveBeenCalledWith(
      'ai_usage',
      expect.objectContaining({
        ai_feature: 'text_generation',
        response_time: 2500,
        model: 'gpt-4'
      })
    )
  })

  it('should provide utility methods', () => {
    const { result } = renderHookWithWrapper(() => useAnalytics())
    
    expect(result.current).toHaveProperty('getStatus')
    expect(result.current).toHaveProperty('flushEvents')
  })
})
