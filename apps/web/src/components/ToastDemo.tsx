import React from 'react'
import { useToastService } from '../services/toastService'
import { useDNDToast } from '../hooks/useDNDToast'

/**
 * Toast Demo Component
 * Demonstrates the enhanced toast system with deduplication and accessibility
 */
export const ToastDemo: React.FC = () => {
  const toastService = useToastService()
  const dndToast = useDNDToast()

  const handleDuplicateTest = () => {
    // This will show the first time
    toastService.success('Duplicate message test')
    
    // This will be suppressed due to deduplication
    setTimeout(() => {
      toastService.success('Duplicate message test')
    }, 1000)
    
    // This will show after 6 seconds (after deduplication window)
    setTimeout(() => {
      toastService.success('Duplicate message test')
    }, 6000)
  }

  const handleCriticalTest = () => {
    // Critical messages always bypass deduplication
    toastService.critical('Critical error occurred!')
    toastService.critical('Critical error occurred!')
    toastService.critical('Critical error occurred!')
  }

  const handleAccessibilityTest = () => {
    // These will be announced to screen readers
    toastService.info('Information message for screen readers')
    toastService.warning('Warning message for screen readers')
    toastService.error('Error message for screen readers')
  }

  const handleDNDTest = () => {
    // Test DND-aware toasts
    dndToast.success('DND-aware success message')
    dndToast.error('DND-aware error message')
    dndToast.critical('DND-aware critical message')
  }

  const handleToastStats = () => {
    const stats = toastService.getStats()
    console.log('Toast Service Stats:', stats)
    toastService.info(`Active toasts: ${stats.activeToasts}, Cached messages: ${stats.cachedMessages}`)
  }

  const handleClearCache = () => {
    toastService.dismissAll()
    toastService.success('Toast cache cleared!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Enhanced Toast System Demo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deduplication Tests */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Deduplication Tests
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleDuplicateTest}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Test Message Deduplication
            </button>
            <button
              onClick={handleCriticalTest}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Test Critical Bypass
            </button>
          </div>
        </div>

        {/* Accessibility Tests */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Accessibility Tests
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleAccessibilityTest}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Test Screen Reader Announcements
            </button>
            <button
              onClick={handleDNDTest}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Test DND-Aware Toasts
            </button>
          </div>
        </div>

        {/* Toast Management */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Toast Management
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleToastStats}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Show Toast Statistics
            </button>
            <button
              onClick={handleClearCache}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Clear Toast Cache
            </button>
          </div>
        </div>

        {/* Individual Toast Types */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Individual Toast Types
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => toastService.success('Operation completed successfully!')}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Success Toast
            </button>
            <button
              onClick={() => toastService.error('Something went wrong!')}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Error Toast
            </button>
            <button
              onClick={() => toastService.warning('Please review your input')}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
            >
              Warning Toast
            </button>
            <button
              onClick={() => toastService.info('Here is some information')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Info Toast
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
          How to Test
        </h3>
        <ul className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
          <li>• <strong>Deduplication:</strong> Click "Test Message Deduplication" to see how identical messages are suppressed</li>
          <li>• <strong>Critical Bypass:</strong> Click "Test Critical Bypass" to see how critical messages always show</li>
          <li>• <strong>Accessibility:</strong> Use a screen reader or check browser console for announcements</li>
          <li>• <strong>DND Mode:</strong> Enable Do Not Disturb mode to see how toasts adapt</li>
          <li>• <strong>Statistics:</strong> Click "Show Toast Statistics" to see current toast state</li>
        </ul>
      </div>
    </div>
  )
}


