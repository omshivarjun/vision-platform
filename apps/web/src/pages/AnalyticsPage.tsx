import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  UsersIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  EyeIcon,
  ClockIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalUsers: number
  activeUsers: number
  translationsToday: number
  documentsProcessed: number
  voiceCommands: number
  accessibilityFeatures: number
  averageResponseTime: number
  accuracyRate: number
  mobileUsage: number
  aiRequests: number
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 1247,
    activeUsers: 892,
    translationsToday: 3456,
    documentsProcessed: 1234,
    voiceCommands: 5678,
    accessibilityFeatures: 2345,
    averageResponseTime: 1.2,
    accuracyRate: 98.5,
    mobileUsage: 67,
    aiRequests: 8901
  })

  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(prev => ({
        ...prev,
        translationsToday: prev.translationsToday + Math.floor(Math.random() * 10),
        voiceCommands: prev.voiceCommands + Math.floor(Math.random() * 5),
        aiRequests: prev.aiRequests + Math.floor(Math.random() * 15)
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const metrics = [
    {
      title: 'Total Users',
      value: analyticsData.totalUsers.toLocaleString(),
      change: '+12.5%',
      icon: UsersIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Users',
      value: analyticsData.activeUsers.toLocaleString(),
      change: '+8.3%',
      icon: GlobeAltIcon,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Translations Today',
      value: analyticsData.translationsToday.toLocaleString(),
      change: '+15.2%',
      icon: DocumentTextIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Voice Commands',
      value: analyticsData.voiceCommands.toLocaleString(),
      change: '+22.1%',
      icon: MicrophoneIcon,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const serviceMetrics = [
    {
      name: 'Document Processing',
      value: analyticsData.documentsProcessed,
      percentage: 85,
      color: 'bg-blue-500'
    },
    {
      name: 'Accessibility Features',
      value: analyticsData.accessibilityFeatures,
      percentage: 92,
      color: 'bg-green-500'
    },
    {
      name: 'AI Requests',
      value: analyticsData.aiRequests,
      percentage: 78,
      color: 'bg-purple-500'
    },
    {
      name: 'Mobile Usage',
      value: analyticsData.mobileUsage,
      percentage: 67,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4"
          >
            <ChartBarIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Real-time insights into platform usage, user engagement, and AI service performance.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            {['1d', '7d', '30d', '90d'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {timeframe === '1d' ? '24h' : timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Metrics */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUpIcon className="w-5 h-5 mr-2 text-blue-600" />
              Performance Metrics
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Average Response Time
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {analyticsData.averageResponseTime}s
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (analyticsData.averageResponseTime / 3) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Accuracy Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {analyticsData.accuracyRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analyticsData.accuracyRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Service Usage */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <CpuChipIcon className="w-5 h-5 mr-2 text-purple-600" />
              Service Usage
            </h2>
            
            <div className="space-y-4">
              {serviceMetrics.map((service, index) => (
                <div key={service.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {service.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {service.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`${service.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Real-time Activity */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-green-600" />
            Real-time Activity
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
              <DevicePhoneMobileIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Mobile Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.mobileUsage}%
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <EyeIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(analyticsData.activeUsers * 0.3)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <MicrophoneIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Voice Commands/min</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.floor(analyticsData.voiceCommands / 1440)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
