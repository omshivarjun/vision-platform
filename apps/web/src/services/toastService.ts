import React from 'react'
import { toastSuccess, toastError, toastCritical, toastInfo, toastWarning, clearToastCache, getToastStats } from '../utils/toast'
import { useAccessibilityAnnouncer } from '../components/AccessibilityAnnouncer'

/**
 * Toast Service Configuration
 */
export interface ToastServiceConfig {
  enableDeduplication: boolean
  deduplicationWindowMs: number
  enableAccessibility: boolean
  criticalErrorBypass: boolean
  maxToasts: number
}

const DEFAULT_CONFIG: ToastServiceConfig = {
  enableDeduplication: true,
  deduplicationWindowMs: 5000,
  enableAccessibility: true,
  criticalErrorBypass: true,
  maxToasts: 5
}

/**
 * Toast Service Class
 * Provides centralized toast management with deduplication and accessibility
 */
export class ToastService {
  private config: ToastServiceConfig
  private activeToasts: Set<string> = new Set()
  private messageHistory: Map<string, number> = new Map()

  constructor(config: Partial<ToastServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Show a success toast with deduplication
   */
  success(message: string, options?: any) {
    if (this.shouldShowToast(message, 'success')) {
      this.announceToScreenReader(message, 'polite')
      return toastSuccess(message, options)
    }
    return null
  }

  /**
   * Show an error toast with deduplication
   */
  error(message: string, options?: any) {
    if (this.shouldShowToast(message, 'error')) {
      this.announceToScreenReader(message, 'assertive')
      return toastError(message, options)
    }
    return null
  }

  /**
   * Show a critical error toast that bypasses deduplication
   */
  critical(message: string, options?: any) {
    // Critical errors always bypass deduplication
    this.announceToScreenReader(message, 'assertive')
    return toastCritical(message, options)
  }

  /**
   * Show an info toast with deduplication
   */
  info(message: string, options?: any) {
    if (this.shouldShowToast(message, 'info')) {
      this.announceToScreenReader(message, 'polite')
      return toastInfo(message, options)
    }
    return null
  }

  /**
   * Show a warning toast with deduplication
   */
  warning(message: string, options?: any) {
    if (this.shouldShowToast(message, 'warning')) {
      this.announceToScreenReader(message, 'polite')
      return toastWarning(message, options)
    }
    return null
  }

  /**
   * Show a loading toast
   */
  loading(message: string, options?: any) {
    return toastInfo(message, { ...options, duration: Infinity })
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(toastId: string) {
    // This would need to be implemented with react-hot-toast's dismiss method
    // For now, we'll just remove it from our tracking
    this.activeToasts.delete(toastId)
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.activeToasts.clear()
    this.messageHistory.clear()
    clearToastCache()
  }

  /**
   * Get toast service statistics
   */
  getStats() {
    return {
      ...getToastStats(),
      activeToasts: this.activeToasts.size,
      messageHistory: this.messageHistory.size,
      config: this.config
    }
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<ToastServiceConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Determine if a toast should be shown based on deduplication rules
   */
  private shouldShowToast(message: string, type: string): boolean {
    if (!this.config.enableDeduplication) {
      return true
    }

    const now = Date.now()
    const lastShown = this.messageHistory.get(message) || 0
    const timeSinceLastShown = now - lastShown

    // Check if message is within deduplication window
    if (timeSinceLastShown < this.config.deduplicationWindowMs) {
      return false
    }

    // Check if we've reached max toast limit
    if (this.activeToasts.size >= this.config.maxToasts) {
      return false
    }

    // Update message history
    this.messageHistory.set(message, now)
    return true
  }

  /**
   * Announce message to screen reader if accessibility is enabled
   */
  private announceToScreenReader(message: string, priority: 'polite' | 'assertive') {
    if (!this.config.enableAccessibility) {
      return
    }

    // This would integrate with the AccessibilityAnnouncer component
    // For now, we'll use a simple approach
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.volume = 0.5
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }
}

/**
 * React Hook for using the Toast Service
 */
export const useToastService = () => {
  const [toastService] = React.useState(() => new ToastService())
  const { announceAssertive, announcePolite } = useAccessibilityAnnouncer()

  const enhancedToastService = React.useMemo(() => ({
    ...toastService,
    success: (message: string, options?: any) => {
      announcePolite(`Success: ${message}`)
      return toastService.success(message, options)
    },
    error: (message: string, options?: any) => {
      announceAssertive(`Error: ${message}`)
      return toastService.error(message, options)
    },
    critical: (message: string, options?: any) => {
      announceAssertive(`Critical Error: ${message}`)
      return toastService.critical(message, options)
    },
    info: (message: string, options?: any) => {
      announcePolite(`Information: ${message}`)
      return toastService.info(message, options)
    },
    warning: (message: string, options?: any) => {
      announcePolite(`Warning: ${message}`)
      return toastService.warning(message, options)
    }
  }), [toastService, announceAssertive, announcePolite])

  return enhancedToastService
}

// Export default instance
export const toastService = new ToastService()
