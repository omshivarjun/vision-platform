import toast, { ToastOptions } from 'react-hot-toast'

// Dedup identical messages within windowMs. Critical messages can bypass with { important: true }.
const recentMessages = new Map<string, number>()
const DEFAULT_WINDOW_MS = 5000

interface DedupOptions extends ToastOptions {
  important?: boolean
  windowMs?: number
  critical?: boolean // Critical errors always bypass dedupe
  ariaLive?: 'polite' | 'assertive' | 'off'
}

export function showToast(message: string, options: DedupOptions = {}) {
  const { 
    important, 
    critical = false, 
    windowMs = DEFAULT_WINDOW_MS, 
    ariaLive = 'polite',
    ...toastOptions 
  } = options
  
  const now = Date.now()
  const last = recentMessages.get(message) || 0
  
  // Critical errors and important messages always bypass dedupe
  if (!critical && !important && now - last < windowMs) {
    return
  }
  
  // Update the timestamp for this message
  recentMessages.set(message, now)
  
  // Enhanced toast options with accessibility
  const enhancedOptions: ToastOptions = {
    ...toastOptions,
    // Add accessibility attributes
    'aria-live': ariaLive,
    'role': 'alert',
    // Ensure critical messages are more prominent
    duration: critical ? 8000 : toastOptions.duration || 4000,
    style: {
      ...toastOptions.style,
      // Add visual indicators for critical messages
      borderLeft: critical ? '4px solid #EF4444' : undefined,
      fontWeight: critical ? '600' : undefined,
    }
  }
  
  return toast(message, enhancedOptions)
}

export const toastSuccess = (message: string, options?: DedupOptions) =>
  showToast(message, { ...options, icon: '✅', ariaLive: 'polite' })

export const toastError = (message: string, options?: DedupOptions) =>
  showToast(message, { ...options, icon: '❌', important: true, ariaLive: 'assertive' })

export const toastCritical = (message: string, options?: DedupOptions) =>
  showToast(message, { ...options, icon: '🚨', critical: true, ariaLive: 'assertive' })

export const toastInfo = (message: string, options?: DedupOptions) =>
  showToast(message, { ...options, icon: 'ℹ️', ariaLive: 'polite' })

export const toastWarning = (message: string, options?: DedupOptions) =>
  showToast(message, { ...options, icon: '⚠️', ariaLive: 'polite' })

// Utility function to clear recent message cache
export const clearToastCache = () => {
  recentMessages.clear()
}

// Utility function to get deduplication stats
export const getToastStats = () => {
  return {
    cachedMessages: recentMessages.size,
    windowMs: DEFAULT_WINDOW_MS
  }
}
