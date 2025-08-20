import { useCallback, useEffect, useRef } from 'react'
import { analyticsService, AnalyticsEvent } from '../services/analyticsService'

/**
 * React Hook for Analytics
 * Provides easy access to analytics functionality throughout the application
 */
export const useAnalytics = () => {
  const sessionStartTime = useRef<number>(Date.now())
  const lastActivityTime = useRef<number>(Date.now())

  // Track session start
  useEffect(() => {
    analyticsService.trackEvent('session_start', {
      session_duration: 0,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })

    // Track session end on unmount
    return () => {
      const sessionDuration = Date.now() - sessionStartTime.current
      analyticsService.trackEvent('session_end', {
        session_duration: sessionDuration,
        total_events: analyticsService.getStatus().queueSize
      })
    }
  }, [])

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityTime.current
      
      // Track activity if more than 30 seconds have passed
      if (timeSinceLastActivity > 30000) {
        analyticsService.trackEvent('user_activity', {
          time_since_last_activity: timeSinceLastActivity,
          activity_type: 'user_interaction'
        })
        lastActivityTime.current = now
      }
    }

    // Track various user activities
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [])

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        analyticsService.trackEvent('page_hidden', {
          timestamp: new Date().toISOString()
        })
      } else {
        analyticsService.trackEvent('page_visible', {
          timestamp: new Date().toISOString(),
          time_hidden: Date.now() - lastActivityTime.current
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Track performance metrics
  useEffect(() => {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            analyticsService.trackEvent('page_performance', {
              load_time: navEntry.loadEventEnd - navEntry.loadEventStart,
              dom_content_loaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              first_paint: navEntry.responseStart - navEntry.requestStart,
              url: window.location.href
            })
          }
        }
      })

      observer.observe({ entryTypes: ['navigation'] })
      return () => observer.disconnect()
    }
  }, [])

  // Analytics methods
  const trackEvent = useCallback((
    eventType: string, 
    properties: Record<string, any> = {}, 
    userId?: string,
    sessionId?: string
  ) => {
    return analyticsService.trackEvent(eventType, properties, userId, sessionId)
  }, [])

  const trackPageView = useCallback((pageName: string, properties: Record<string, any> = {}) => {
    return analyticsService.trackPageView(pageName, properties)
  }, [])

  const trackUserAction = useCallback((action: string, properties: Record<string, any> = {}) => {
    return analyticsService.trackUserAction(action, properties)
  }, [])

  const trackFeatureUsage = useCallback((feature: string, properties: Record<string, any> = {}) => {
    return analyticsService.trackFeatureUsage(feature, properties)
  }, [])

  const trackError = useCallback((errorType: string, error: Error, properties: Record<string, any> = {}) => {
    return analyticsService.trackError(errorType, error, properties)
  }, [])

  const trackConversion = useCallback((funnelStep: string, value?: number, properties: Record<string, any> = {}) => {
    return analyticsService.trackConversion(funnelStep, value, properties)
  }, [])

  const trackTranslation = useCallback((
    sourceLanguage: string, 
    targetLanguage: string, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('translation_request', {
      source_language: sourceLanguage,
      target_language: targetLanguage,
      ...properties
    })
  }, [])

  const trackDocumentProcessing = useCallback((
    documentType: string, 
    processingTime: number, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('document_processing', {
      document_type: documentType,
      processing_time: processingTime,
      ...properties
    })
  }, [])

  const trackAIUsage = useCallback((
    aiFeature: string, 
    responseTime: number, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('ai_usage', {
      ai_feature: aiFeature,
      response_time: responseTime,
      ...properties
    })
  }, [])

  const trackPayment = useCallback((
    amount: number, 
    currency: string, 
    paymentMethod: string, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('payment', {
      amount,
      currency,
      payment_method: paymentMethod,
      ...properties
    })
  }, [])

  const trackSearch = useCallback((
    query: string, 
    resultsCount: number, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('search', {
      query,
      results_count: resultsCount,
      ...properties
    })
  }, [])

  const trackDownload = useCallback((
    fileType: string, 
    fileSize: number, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('download', {
      file_type: fileType,
      file_size: fileSize,
      ...properties
    })
  }, [])

  const trackUpload = useCallback((
    fileType: string, 
    fileSize: number, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('upload', {
      file_type: fileType,
      file_size: fileSize,
      ...properties
    })
  }, [])

  const trackFormSubmission = useCallback((
    formName: string, 
    success: boolean, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('form_submission', {
      form_name: formName,
      success,
      ...properties
    })
  }, [])

  const trackButtonClick = useCallback((
    buttonName: string, 
    buttonLocation: string, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('button_click', {
      button_name: buttonName,
      button_location: buttonLocation,
      ...properties
    })
  }, [])

  const trackNavigation = useCallback((
    fromPage: string, 
    toPage: string, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('navigation', {
      from_page: fromPage,
      to_page: toPage,
      ...properties
    })
  }, [])

  const trackMediaInteraction = useCallback((
    mediaType: 'audio' | 'video' | 'image', 
    action: 'play' | 'pause' | 'stop' | 'seek' | 'volume_change', 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('media_interaction', {
      media_type: mediaType,
      action,
      ...properties
    })
  }, [])

  const trackAccessibility = useCallback((
    feature: string, 
    action: string, 
    properties: Record<string, any> = {}
  ) => {
    return analyticsService.trackEvent('accessibility_usage', {
      feature,
      action,
      ...properties
    })
  }, [])

  const getStatus = useCallback(() => {
    return analyticsService.getStatus()
  }, [])

  const flushEvents = useCallback(() => {
    return analyticsService.flushEvents()
  }, [])

  return {
    // Core tracking methods
    trackEvent,
    trackPageView,
    trackUserAction,
    trackFeatureUsage,
    trackError,
    trackConversion,
    
    // Feature-specific tracking
    trackTranslation,
    trackDocumentProcessing,
    trackAIUsage,
    trackPayment,
    trackSearch,
    trackDownload,
    trackUpload,
    trackFormSubmission,
    trackButtonClick,
    trackNavigation,
    trackMediaInteraction,
    trackAccessibility,
    
    // Utility methods
    getStatus,
    flushEvents
  }
}

// Export the hook
export default useAnalytics


