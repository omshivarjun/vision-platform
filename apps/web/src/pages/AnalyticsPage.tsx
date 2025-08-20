import React from 'react'
import { motion } from 'framer-motion'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import { useAnalytics } from '../hooks/useAnalytics'

export default function AnalyticsPage() {
  const analytics = useAnalytics()

  // Track page view when component mounts
  React.useEffect(() => {
    analytics.trackPageView('Analytics Page', {
      page_type: 'analytics',
      user_role: 'user'
    })
  }, [analytics])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real-time insights into platform usage, user behavior, and system performance.
            Monitor key metrics and track growth across all features.
          </p>
        </motion.div>

        {/* Analytics Dashboard Component */}
        <AnalyticsDashboard 
          timeRange="7d"
          showRealTime={true}
          showHistorical={true}
          showUserAnalytics={true}
        />

        {/* Event Tracking Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            🧪 Event Tracking Demo
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Test the analytics system by tracking custom events. These events will be recorded and appear in your analytics data.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => analytics.trackEvent('demo_button_click', { button: 'feature_test', user_id: 'demo_user' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Test Feature
            </button>
            <button
              onClick={() => analytics.trackEvent('demo_user_action', { action: 'page_navigation', destination: 'analytics' })}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              User Action
            </button>
            <button
              onClick={() => analytics.trackEvent('demo_error', { error_type: 'simulated', component: 'analytics_demo' })}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Simulate Error
            </button>
            <button
              onClick={() => analytics.trackEvent('demo_conversion', { funnel_step: 'demo_complete', value: 100 })}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Conversion
            </button>
          </div>
        </motion.div>

        {/* Analytics Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            📈 Analytics Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {analytics.getStatus().queueSize}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Events in Queue</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {analytics.getStatus().isOnline ? 'Online' : 'Offline'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connection Status</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {analytics.getStatus().sessionId.slice(-8)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Session ID</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
