import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  ChartPieIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { analyticsService, AnalyticsEvent, RealTimeData } from '../services/analyticsService'
import toast from 'react-hot-toast'

export default function AnalyticsPage() {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [historicalMetrics, setHistoricalMetrics] = useState<any[]>([])
  const [userAnalytics, setUserAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('page_views')
  const [refreshInterval, setRefreshInterval] = useState(5000)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
    
    // Set up auto-refresh
    let interval: NodeJS.Timeout
    if (isAutoRefresh) {
      interval = setInterval(loadAnalyticsData, refreshInterval)
    }

    // Track page view
    analyticsService.trackPageView('Analytics Dashboard', {
      page_type: 'dashboard',
      user_role: 'admin'
    })

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoRefresh, refreshInterval])

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      
      // Load real-time data
      const realTime = await analyticsService.getRealTimeData()
      setRealTimeData(realTime)
      
      // Load historical metrics
      const historical = await analyticsService.getHistoricalMetrics(selectedMetric, timeRange, '1h')
      setHistoricalMetrics(historical)
      
      // Load user analytics
      const userId = localStorage.getItem('userId') || 'anonymous'
      const userData = await analyticsService.getUserAnalytics(userId, timeRange)
      setUserAnalytics(userData)
      
    } catch (error) {
      console.error('Failed to load analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async (format: 'csv' | 'json') => {
    try {
      await analyticsService.exportAnalytics(timeRange, format)
      toast.success(`Analytics data exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Failed to export data:', error)
      toast.error('Failed to export analytics data')
    }
  }

  const trackCustomEvent = (eventType: string, properties: Record<string, any> = {}) => {
    analyticsService.trackEvent(eventType, properties)
    toast.success(`Event '${eventType}' tracked successfully!`)
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'page_views': return '👁️'
      case 'translation': return '🌍'
      case 'document_processing': return '📄'
      case 'ai_assistant_usage': return '🤖'
      case 'payment': return '💳'
      default: return '📊'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'page_views': return 'text-blue-600'
      case 'translation': return 'text-green-600'
      case 'document_processing': return 'text-purple-600'
      case 'ai_assistant_usage': return 'text-orange-600'
      case 'payment': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

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

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Range
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Metric
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="page_views">Page Views</option>
                  <option value="translation">Translations</option>
                  <option value="document_processing">Document Processing</option>
                  <option value="ai_assistant_usage">AI Assistant Usage</option>
                  <option value="payment">Payments</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={isAutoRefresh}
                  onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-700 dark:text-gray-300">
                  Auto-refresh
                </label>
              </div>
              
              <button
                onClick={loadAnalyticsData}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExportData('csv')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportData('json')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Real-time Metrics */}
        {realTimeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(realTimeData.activeUsers)}
                  </p>
                </div>
                <UsersIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  <span>+12% from last hour</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Events/Min</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(realTimeData.eventsPerMinute)}
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-blue-600">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  <span>+8% from last hour</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU Usage</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {realTimeData.systemMetrics.cpu.toFixed(1)}%
                  </p>
                </div>
                <CpuChipIcon className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${realTimeData.systemMetrics.cpu}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {realTimeData.systemMetrics.responseTime}ms
                  </p>
                </div>
                <DevicePhoneMobileIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                  <span>-15% from last hour</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Events */}
        {realTimeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ChartPieIcon className="w-5 h-5 mr-2 text-blue-600" />
                Top Events
              </h3>
              <div className="space-y-4">
                {realTimeData.topEvents.map((event, index) => (
                  <div key={event.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getMetricIcon(event.type)}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatNumber(event.count)}
                      </span>
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getMetricColor(event.type)}`}
                          style={{ width: `${(event.count / Math.max(...realTimeData.topEvents.map(e => e.count))) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2 text-green-600" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {realTimeData.recentActivity.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-lg">{getMetricIcon(event.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.properties?.page_name || event.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Historical Charts */}
        {historicalMetrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-purple-600" />
              Historical Trends - {selectedMetric.replace('_', ' ').toUpperCase()}
            </h3>
            <div className="h-64 flex items-end justify-center space-x-2">
              {historicalMetrics.map((metric, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-8 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-700"
                    style={{ height: `${(metric.value / Math.max(...historicalMetrics.map(m => m.value))) * 200}px` }}
                    title={`${metric.value} at ${new Date(metric.timestamp).toLocaleTimeString()}`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(metric.timestamp).getHours()}:00
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* User Analytics */}
        {userAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UsersIcon className="w-5 h-5 mr-2 text-indigo-600" />
              User Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">
                  {userAnalytics.totalSessions || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {userAnalytics.avgSessionDuration || 0}m
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Session Duration</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {userAnalytics.featureUsage?.translation || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Translations Used</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Event Tracking Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-yellow-600" />
            Event Tracking Demo
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Test the analytics system by tracking custom events. These events will be recorded and appear in your analytics data.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => trackCustomEvent('demo_button_click', { button: 'feature_test', user_id: 'demo_user' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Test Feature
            </button>
            <button
              onClick={() => trackCustomEvent('demo_user_action', { action: 'page_navigation', destination: 'analytics' })}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              User Action
            </button>
            <button
              onClick={() => trackCustomEvent('demo_error', { error_type: 'simulated', component: 'analytics_demo' })}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Simulate Error
            </button>
            <button
              onClick={() => trackCustomEvent('demo_conversion', { funnel_step: 'demo_complete', value: 100 })}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Conversion
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
