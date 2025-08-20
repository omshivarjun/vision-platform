import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  UsersIcon, 
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon,
  ChartPieIcon,
  ArrowPathIcon,
  EyeIcon,
  ClockIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import { analyticsService, RealTimeData, HistoricalMetric, UserAnalytics, AnalyticsSummary } from '../services/analyticsService'
import { useAnalytics } from '../hooks/useAnalytics'

interface AnalyticsDashboardProps {
  timeRange?: string
  showRealTime?: boolean
  showHistorical?: boolean
  showUserAnalytics?: boolean
  className?: string
}

/**
 * Comprehensive Analytics Dashboard Component
 * Displays real-time metrics, historical trends, and user analytics
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  timeRange = '7d',
  showRealTime = true,
  showHistorical = true,
  showUserAnalytics = true,
  className = ''
}) => {
  const analytics = useAnalytics()
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null)
  const [historicalMetrics, setHistoricalMetrics] = useState<HistoricalMetric[]>([])
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('page_views')
  const [refreshInterval, setRefreshInterval] = useState(10000)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const promises = []

      if (showRealTime) {
        promises.push(analyticsService.getRealTimeData().then(setRealTimeData))
      }

      if (showHistorical) {
        promises.push(
          analyticsService.getHistoricalMetrics(selectedMetric, timeRange, '1h')
            .then(setHistoricalMetrics)
        )
      }

      if (showUserAnalytics) {
        const userId = localStorage.getItem('userId') || 'anonymous'
        promises.push(
          analyticsService.getUserAnalytics(userId, timeRange).then(setUserAnalytics)
        )
      }

      promises.push(
        analyticsService.getAnalyticsSummary(timeRange).then(setAnalyticsSummary)
      )

      await Promise.all(promises)

      // Track dashboard view
      analytics.trackPageView('Analytics Dashboard', {
        time_range: timeRange,
        selected_metric: selectedMetric,
        components_shown: {
          real_time: showRealTime,
          historical: showHistorical,
          user_analytics: showUserAnalytics
        }
      })

    } catch (error) {
      console.error('Failed to load analytics data:', error)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh setup
  useEffect(() => {
    loadAnalyticsData()
    
    let interval: NodeJS.Timeout
    if (isAutoRefresh) {
      interval = setInterval(loadAnalyticsData, refreshInterval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timeRange, selectedMetric, showRealTime, showHistorical, showUserAnalytics, isAutoRefresh, refreshInterval])

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // Get metric icon
  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'page_views': return <EyeIcon className="w-5 h-5" />
      case 'translation': return <GlobeAltIcon className="w-5 h-5" />
      case 'document_processing': return <DocumentTextIcon className="w-5 h-5" />
      case 'ai_assistant_usage': return <CpuChipIcon className="w-5 h-5" />
      case 'payment': return <ChartBarIcon className="w-5 h-5" />
      default: return <ChartBarIcon className="w-5 h-5" />
    }
  }

  // Get metric color
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

  // Calculate trend percentage
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Generate mock historical data for development
  const generateMockHistoricalData = (): HistoricalMetric[] => {
    const now = new Date()
    const data: HistoricalMetric[] = []
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.floor(Math.random() * 100) + 20
      })
    }
    
    return data
  }

  // Memoized chart data
  const chartData = useMemo(() => {
    if (historicalMetrics.length > 0) {
      return historicalMetrics
    }
    // Fallback to mock data in development
    return generateMockHistoricalData()
  }, [historicalMetrics])

  // Handle export
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      await analyticsService.exportAnalytics(timeRange, format)
      analytics.trackEvent('analytics_export', { format, time_range: timeRange })
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    loadAnalyticsData()
    analytics.trackEvent('analytics_refresh', { time_range: timeRange })
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <ChartBarIcon className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
        <button
          onClick={loadAnalyticsData}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
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
            
            {showHistorical && (
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
            )}
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
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      {analyticsSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analyticsSummary.totalEvents)}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analyticsSummary.uniqueUsers)}
                </p>
              </div>
              <UsersIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(analyticsSummary.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Real-time Metrics */}
      {showRealTime && realTimeData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {realTimeData.systemMetrics.responseTime}ms
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-purple-600" />
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

      {/* Top Events and Recent Activity */}
      {showRealTime && realTimeData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
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
      {showHistorical && chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-purple-600" />
            Historical Trends - {selectedMetric.replace('_', ' ').toUpperCase()}
          </h3>
          <div className="h-64 flex items-end justify-center space-x-2">
            {chartData.map((metric, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-8 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-700 cursor-pointer"
                  style={{ height: `${(metric.value / Math.max(...chartData.map(m => m.value))) * 200}px` }}
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
      {showUserAnalytics && userAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">Loading analytics data...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard


