import { useDND } from '../contexts/DNDContext'
import toast, { ToastOptions } from 'react-hot-toast'
import { showToast as showToastDedup, toastCritical as toastCriticalDedup } from '@/utils/toast'

export function useDNDToast() {
  const { isDNDEnabled, dndSettings } = useDND()

  const showToastLocal = (message: string, options?: ToastOptions & { critical?: boolean }) => {
    const { critical = false, ...toastOptions } = options || {}
    
    // Critical messages always bypass DND restrictions
    if (critical) {
      return showToastDedup(message, { ...toastOptions, critical: true })
    }
    
    // If DND is enabled and notifications are suppressed, don't show toast
    if (isDNDEnabled && dndSettings.suppressNotifications) {
      return
    }

    // If DND is enabled and sounds are suppressed, remove sound-related options
    if (isDNDEnabled && dndSettings.suppressSounds) {
      const { duration, ...otherOptions } = toastOptions
      return showToastDedup(message, {
        ...otherOptions,
        duration: duration || 4000,
      })
    }

    // Normal toast behavior, deduplicated
    return showToastDedup(message, toastOptions)
  }

  const success = (message: string, options?: ToastOptions) => {
    return showToastLocal(message, { ...options, icon: '✅' })
  }

  const error = (message: string, options?: ToastOptions) => {
    return showToastLocal(message, { ...options, icon: '❌', important: true })
  }

  const critical = (message: string, options?: ToastOptions) => {
    return showToastLocal(message, { ...options, icon: '🚨', critical: true })
  }

  const warning = (message: string, options?: ToastOptions) => {
    return showToastLocal(message, { ...options, icon: '⚠️' })
  }

  const info = (message: string, options?: ToastOptions) => {
    return showToastLocal(message, { ...options, icon: 'ℹ️' })
  }

  return {
    showToast: showToastLocal,
    success,
    error,
    critical,
    warning,
    info,
    // Expose the original toast for cases where we need to bypass DND
    toast: (message: string, options?: ToastOptions) => toast(message, options)
  }
}
