import React from 'react'
import { toastSuccess, toastError, toastCritical, toastInfo, toastWarning, clearToastCache, getToastStats } from '../utils/toast'

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
      const toastId = toastSuccess(message, options)
      if (toastId) {
        this.activeToasts.add(toastId.toString())
        this.announceToScreenReader(`Success: ${message}`, 'polite')
        // Auto-remove from active toasts after duration
        setTimeout(() => {
          this.activeToasts.delete(toastId.toString())
        }, options?.duration || 4000)
      }
      return toastId
    }
    return null
  }

  /**
   * Show an error toast with deduplication
   */
  error(message: string, options?: any) {
    if (this.shouldShowToast(message, 'error')) {
      const toastId = toastError(message, options)
      if (toastId) {
        this.activeToasts.add(toastId.toString())
        this.announceToScreenReader(`Error: ${message}`, 'assertive')
        // Auto-remove from active toasts after duration
        setTimeout(() => {
          this.activeToasts.delete(toastId.toString())
        }, options?.duration || 4000)
      }
      return toastId
    }
    return null
  }

  /**
   * Show a critical error toast that bypasses deduplication
   */
  critical(message: string, options?: any) {
    // Critical errors always bypass deduplication if configured
    if (this.config.criticalErrorBypass || this.shouldShowToast(message, 'critical')) {
      const toastId = toastCritical(message, options)
      if (toastId) {
        this.activeToasts.add(toastId.toString())
        this.announceToScreenReader(`Critical Error: ${message}`, 'assertive')
        // Auto-remove from active toasts after duration
        setTimeout(() => {
          this.activeToasts.delete(toastId.toString())
        }, options?.duration || 6000)
      }
      return toastId
    }
    return null
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
    const messageKey = `${type}:${message}`
    const lastShown = this.messageHistory.get(messageKey) || 0
    const timeSinceLastShown = now - lastShown

    // Check if message is within deduplication window
    if (timeSinceLastShown < this.config.deduplicationWindowMs) {
      console.debug(`Toast deduplicated: ${message} (shown ${timeSinceLastShown}ms ago)`)
      return false
    }

    // Check if we've reached max toast limit
    if (this.activeToasts.size >= this.config.maxToasts) {
      // Remove oldest toast if at limit
      const oldest = this.activeToasts.values().next().value
      if (oldest) {
        this.activeToasts.delete(oldest)
      }
    }

    // Update message history
    this.messageHistory.set(messageKey, now)
    
    // Clean up old history entries
    for (const [key, time] of this.messageHistory.entries()) {
      if (now - time > this.config.deduplicationWindowMs * 2) {
        this.messageHistory.delete(key)
      }
    }
    
    return true
  }

  /**
   * Announce message to screen reader if accessibility is enabled
   */
  private announceToScreenReader(message: string, priority: 'polite' | 'assertive') {
    if (!this.config.enableAccessibility) {
      return
    }

    // Create an aria-live region for screen reader announcements
    if (typeof window !== 'undefined') {
      const announcer = document.createElement('div')
      announcer.setAttribute('aria-live', priority)
      announcer.setAttribute('aria-atomic', 'true')
      announcer.style.position = 'absolute'
      announcer.style.left = '-10000px'
      announcer.style.width = '1px'
      announcer.style.height = '1px'
      announcer.style.overflow = 'hidden'
      
      document.body.appendChild(announcer)
      announcer.textContent = message
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(announcer)
      }, 1000)
    }
  }
}

/**
 * React Hook for using the Toast Service
 */
export const useToastService = () => {
  const [toastService] = React.useState(() => new ToastService())

  // Return the toast service directly - announcements are handled internally
  return toastService
}

// Export default instance
export const toastService = new ToastService()
