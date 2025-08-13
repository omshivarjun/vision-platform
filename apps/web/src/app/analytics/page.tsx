'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Translation {
  _id: string;
  source_text: string;
  source_lang: string;
  target_lang: string;
  translated_text: string;
  user_id: string;
  created_at: string;
}

interface OcrResult {
  _id: string;
  image_name: string;
  extracted_text: string;
  confidence: number;
  user_id: string;
  created_at: string;
}

interface SpeechData {
  _id: string;
  audio_file: string;
  transcribed_text: string;
  duration: number;
  user_id: string;
  created_at: string;
}

interface AccessibilityReport {
  _id: string;
  page_url: string;
  issues: string[];
  score: number;
  user_id: string;
  created_at: string;
}

export default function AnalyticsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [ocrResults, setOcrResults] = useState<OcrResult[]>([]);
  const [speechData, setSpeechData] = useState<SpeechData[]>([]);
  const [accessibilityReports, setAccessibilityReports] = useState<AccessibilityReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from API endpoints (these would need to be implemented in the backend)
    // For now, we'll show the data structure
    setLoading(false);
  }, []);

  const stats = [
    { name: 'Total Users', value: '3', change: '+3', changeType: 'positive' },
    { name: 'Translations', value: '3', change: '+3', changeType: 'positive' },
    { name: 'OCR Results', value: '2', change: '+2', changeType: 'positive' },
    { name: 'Speech Files', value: '2', change: '+2', changeType: 'positive' },
    { name: 'Accessibility Reports', value: '2', change: '+2', changeType: 'positive' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Vision Platform Analytics
          </h1>
          <p className="text-xl text-gray-600">
            Real-time insights into your AI platform usage
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-sm font-medium ${
                  stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">👥 Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">John Doe</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">john@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">User</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Jane Smith</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">jane@example.com</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Admin</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Demo User</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">demo@vision.com</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">User</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Translations Table */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🌐 Recent Translations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">EN</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ES</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Hello World → Hola Mundo</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">EN</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">FR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Good morning → Bonjour</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">EN</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">DE</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Thank you → Danke</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* OCR and Speech Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* OCR Results */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">📄 OCR Results</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">document1.jpg</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">95%</span>
                </div>
                <p className="text-sm text-gray-600">This is a sample document with text that was extracted using OCR technology.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">receipt.png</h4>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">92%</span>
                </div>
                <p className="text-sm text-gray-600">Total: $25.99, Tax: $2.60, Grand Total: $28.59</p>
              </div>
            </div>
          </div>

          {/* Speech Data */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🎤 Speech Recognition</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">speech1.wav</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">3.5s</span>
                </div>
                <p className="text-sm text-gray-600">Hello, this is a test of speech recognition technology.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">meeting.mp3</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">12.0s</span>
                </div>
                <p className="text-sm text-gray-600">Welcome to our team meeting. Today we will discuss the project timeline.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Reports */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">♿ Accessibility Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">example.com</h4>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Score: 85</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Missing alt text for images</li>
                <li>• Low contrast text</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">demo-site.com</h4>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Score: 72</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Missing form labels</li>
                <li>• Keyboard navigation issues</li>
              </ul>
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
              href="/api-docs"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              🔧 API Docs
            </Link>
            <button 
              onClick={() => window.open('http://localhost:3002', '_blank')}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📈 Grafana
            </button>
            <button 
              onClick={() => window.open('http://localhost:9001', '_blank')}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📁 MinIO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
