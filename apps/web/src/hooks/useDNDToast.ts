import { useDND } from '../contexts/DNDContext'
import toast, { ToastOptions } from 'react-hot-toast'

export function useDNDToast() {
  const { isDNDEnabled, dndSettings } = useDND()

  const showToast = (message: string, options?: ToastOptions) => {
    // If DND is enabled and notifications are suppressed, don't show toast
    if (isDNDEnabled && dndSettings.suppressNotifications) {
      return
    }

    // If DND is enabled and sounds are suppressed, remove sound-related options
    if (isDNDEnabled && dndSettings.suppressSounds) {
      const { duration, ...otherOptions } = options || {}
      return toast(message, {
        ...otherOptions,
        duration: duration || 4000, // Longer duration since no sound
      })
    }

    // Normal toast behavior
    return toast(message, options)
  }

  const success = (message: string, options?: ToastOptions) => {
    return showToast(message, { ...options, icon: '✅' })
  }

  const error = (message: string, options?: ToastOptions) => {
    return showToast(message, { ...options, icon: '❌' })
  }

  const warning = (message: string, options?: ToastOptions) => {
    return showToast(message, { ...options, icon: '⚠️' })
  }

  const info = (message: string, options?: ToastOptions) => {
    return showToast(message, { ...options, icon: 'ℹ️' })
  }

  return {
    showToast,
    success,
    error,
    warning,
    info,
    // Expose the original toast for cases where we need to bypass DND
    toast: (message: string, options?: ToastOptions) => toast(message, options)
  }
}
