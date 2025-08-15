@@ .. @@
 import React, { useState, useEffect } from 'react'
 import { motion } from 'framer-motion'
+import { useRealTimeAnalytics } from '../hooks/useRealTimeAnalytics'
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
-  CpuChipIcon
+  CpuChipIcon,
+  ArrowPathIcon,
+  ArrowDownTrayIcon,
+  WifiIcon,
+  ExclamationTriangleIcon
 } from '@heroicons/react/24/outline'

-interface AnalyticsData {
-  totalUsers: number
-  activeUsers: number
-  translationsToday: number
-  documentsProcessed: number
-  voiceCommands: number
-  accessibilityFeatures: number
-  averageResponseTime: number
-  accuracyRate: number
-  mobileUsage: number
-  aiRequests: number
-}
-
 export default function AnalyticsPage() {
-  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
-    totalUsers: 1247,
-    activeUsers: 892,
-    translationsToday: 3456,
-    documentsProcessed: 1234,
-    voiceCommands: 5678,
-    accessibilityFeatures: 2345,
-    averageResponseTime: 1.2,
-    accuracyRate: 98.5,
-    mobileUsage: 67,
-    aiRequests: 8901
-  })
-
   const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
-  const [isLoading, setIsLoading] = useState(false)
+  const [showRealTimeEvents, setShowRealTimeEvents] = useState(true)

-  // Simulate real-time data updates
-  useEffect(() => {
-    const interval = setInterval(() => {
-      setAnalyticsData(prev => ({
-        ...prev,
-        translationsToday: prev.translationsToday + Math.floor(Math.random() * 10),
-        voiceCommands: prev.voiceCommands + Math.floor(Math.random() * 5),
-        aiRequests: prev.aiRequests + Math.floor(Math.random() * 15)
-      }))
-    }, 5000)
-
-    return () => clearInterval(interval)
-  }, [])
+  const {
+    analyticsData,
+    recentEvents,
+    isConnected,
+    connectionError,
+    refreshData,
+    exportData,
+  } = useRealTimeAnalytics()

   const metrics = [
@@ .. @@
         {/* Timeframe Selector */}
         <div className="flex justify-center mb-8">
-          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
+          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg flex items-center space-x-2">
+            {/* Connection Status */}
+            <div className="flex items-center px-3 py-2">
+              <WifiIcon className={`w-4 h-4 mr-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
+              <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
+                {isConnected ? 'Live' : 'Offline'}
+              </span>
+            </div>
+            
+            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
+            
+            {/* Timeframe Buttons */}
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
+            
+            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
+            
+            {/* Action Buttons */}
+            <button
+              onClick={refreshData}
+              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
+              title="Refresh Data"
+            >
+              <ArrowPathIcon className="w-4 h-4" />
+            </button>
+            
+            <button
+              onClick={() => exportData('json')}
+              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
+              title="Export Data"
+            >
+              <ArrowDownTrayIcon className="w-4 h-4" />
+            </button>
           </div>
         </div>

+        {/* Connection Error */}
+        {connectionError && (
+          <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
+            <div className="flex items-center">
+              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
+              <div>
+                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
+                  Real-time Connection Issue
+                </h3>
+                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
+                  {connectionError}. Showing cached data with simulated updates.
+                </p>
+              </div>
+            </div>
+          </div>
+        )}

         {/* Key Metrics Grid */}
@@ .. @@
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
+          {/* Real-time Events */}
+          <motion.div
+            initial={{ x: -50, opacity: 0 }}
+            animate={{ x: 0, opacity: 1 }}
+            transition={{ duration: 0.5 }}
+            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
+          >
+            <div className="flex items-center justify-between mb-6">
+              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
+                <ClockIcon className="w-5 h-5 mr-2 text-green-600" />
+                Real-time Events
+              </h2>
+              <button
+                onClick={() => setShowRealTimeEvents(!showRealTimeEvents)}
+                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
+              >
+                {showRealTimeEvents ? 'Hide' : 'Show'} Events
+              </button>
+            </div>
+            
+            {showRealTimeEvents && (
+              <div className="space-y-3 max-h-96 overflow-y-auto">
+                {recentEvents.length > 0 ? (
+                  recentEvents.slice(0, 20).map((event, index) => (
+                    <motion.div
+                      key={index}
+                      initial={{ x: -20, opacity: 0 }}
+                      animate={{ x: 0, opacity: 1 }}
+                      transition={{ duration: 0.3 }}
+                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
+                    >
+                      <div className="flex items-center">
+                        <div className={`w-2 h-2 rounded-full mr-3 ${
+                          event.type === 'translation' ? 'bg-blue-500' :
+                          event.type === 'document' ? 'bg-green-500' :
+                          event.type === 'voice' ? 'bg-purple-500' :
+                          event.type === 'accessibility' ? 'bg-orange-500' :
+                          'bg-gray-500'
+                        }`}></div>
+                        <div>
+                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
+                            {event.type.replace('_', ' ')}
+                          </p>
+                          <p className="text-xs text-gray-600 dark:text-gray-400">
+                            {new Date(event.timestamp).toLocaleTimeString()}
+                          </p>
+                        </div>
+                      </div>
+                      <div className="text-xs text-gray-500 dark:text-gray-400">
+                        {event.data?.userId ? `User: ${event.data.userId.slice(0, 8)}...` : 'System'}
+                      </div>
+                    </motion.div>
+                  ))
+                ) : (
+                  <div className="text-center py-8">
+                    <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
+                    <p className="text-gray-600 dark:text-gray-400">No recent events</p>
+                  </div>
+                )}
+              </div>
+            )}
+          </motion.div>
+
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
+              
+              {/* Real-time Indicators */}
+              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
+                <div className="flex items-center justify-between text-sm">
+                  <span className="text-gray-600 dark:text-gray-400">Connection Status</span>
+                  <div className="flex items-center">
+                    <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
+                    <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
+                      {isConnected ? 'Live Updates' : 'Cached Data'}
+                    </span>
+                  </div>
+                </div>
+                
+                <div className="flex items-center justify-between text-sm mt-2">
+                  <span className="text-gray-600 dark:text-gray-400">Last Update</span>
+                  <span className="text-gray-900 dark:text-white font-medium">
+                    {new Date().toLocaleTimeString()}
+                  </span>
+                </div>
+              </div>
             </div>
           </motion.div>
-
-          {/* Service Usage */}
-          <motion.div
-            initial={{ x: 50, opacity: 0 }}
-            animate={{ x: 0, opacity: 1 }}
-            transition={{ duration: 0.5 }}
-            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
-          >
-            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
-              <CpuChipIcon className="w-5 h-5 mr-2 text-purple-600" />
-              Service Usage
-            </h2>
-            
-            <div className="space-y-4">
-              {serviceMetrics.map((service, index) => (
-                <div key={service.name}>
-                  <div className="flex justify-between items-center mb-2">
-                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
-                      {service.name}
-                    </span>
-                    <span className="text-sm font-bold text-gray-900 dark:text-white">
-                      {service.value.toLocaleString()}
-                    </span>
-                  </div>
-                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
-                    <div 
-                      className={`${service.color} h-2 rounded-full transition-all duration-500`}
-                      style={{ width: `${service.percentage}%` }}
-                    ></div>
-                  </div>
-                </div>
-              ))}
-            </div>
-          </motion.div>
         </div>

         {/* Real-time Activity */}
@@ .. @@
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
-                {Math.floor(analyticsData.activeUsers * 0.3)}
+                {analyticsData.activeUsers}
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
+
+        {/* Export and Actions */}
+        <motion.div
+          initial={{ y: 50, opacity: 0 }}
+          animate={{ y: 0, opacity: 1 }}
+          transition={{ duration: 0.5, delay: 0.4 }}
+          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
+        >
+          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
+            Data Export & Actions
+          </h2>
+          
+          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
+            <button
+              onClick={() => exportData('json')}
+              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
+            >
+              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
+              Export JSON
+            </button>
+            
+            <button
+              onClick={() => exportData('csv')}
+              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
+            >
+              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
+              Export CSV
+            </button>
+            
+            <button
+              onClick={refreshData}
+              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
+            >
+              <ArrowPathIcon className="w-4 h-4 mr-2" />
+              Refresh Data
+            </button>
+          </div>
+        </motion.div>
       </div>
     </div>
   )
 }