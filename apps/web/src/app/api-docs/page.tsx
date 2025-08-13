'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiEndpoint {
  name: string;
  path: string;
  method: string;
  description: string;
  example: string;
}

export default function ApiDocsPage() {
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const endpoints: ApiEndpoint[] = [
    {
      name: 'API Info',
      path: '/',
      method: 'GET',
      description: 'Get API information and status',
      example: 'http://localhost:3001/'
    },
    {
      name: 'Health Check',
      path: '/health',
      method: 'GET',
      description: 'Check API health and uptime',
      example: 'http://localhost:3001/health'
    }
  ];

  useEffect(() => {
    // Fetch API info
    fetch('http://localhost:3001/')
      .then(response => response.json())
      .then(data => setApiInfo(data))
      .catch(error => console.error('Error fetching API info:', error));

    // Fetch health status
    fetch('http://localhost:3001/health')
      .then(response => response.json())
      .then(data => setHealthStatus(data))
      .catch(error => console.error('Error fetching health status:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔧 Vision Platform API Documentation
          </h1>
          <p className="text-xl text-gray-600">
            Backend API endpoints and integration guide
          </p>
        </div>

        {/* API Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* API Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">API Information</h3>
            {apiInfo ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {apiInfo.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{apiInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-medium">{apiInfo.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="font-medium text-sm">{new Date(apiInfo.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading API info...</div>
            )}
          </div>

          {/* Health Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Health Status</h3>
            {healthStatus ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {healthStatus.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{healthStatus.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{Math.round(healthStatus.uptime / 1000)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{healthStatus.version}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Loading health status...</div>
            )}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Available Endpoints</h3>
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{endpoint.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.method}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{endpoint.description}</p>
                <div className="bg-gray-50 rounded p-3">
                  <code className="text-sm text-gray-800">{endpoint.example}</code>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Guide */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Integration Guide</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h4 className="font-medium text-blue-900 mb-2">Base URL</h4>
              <code className="text-blue-800">http://localhost:3001</code>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <h4 className="font-medium text-green-900 mb-2">Authentication</h4>
              <p className="text-green-800">Currently no authentication required. All endpoints are publicly accessible.</p>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Response Format</h4>
              <p className="text-yellow-800">All endpoints return JSON responses with consistent structure.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link 
              href="/"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              🏠 Home
            </Link>
            <button 
              onClick={() => window.open('http://localhost:3001/', '_blank')}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔧 API Info
            </button>
            <button 
              onClick={() => window.open('http://localhost:3001/health', '_blank')}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ❤️ Health Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
