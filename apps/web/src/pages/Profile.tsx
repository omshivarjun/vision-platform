import React, { useState } from 'react'
import { User, Settings, History, BookOpen, Globe, Download, Trash2 } from 'lucide-react'

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    language: 'English',
    accessibilityLevel: 'Standard',
    notifications: true,
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'history', label: 'Translation History', icon: History },
    { id: 'glossary', label: 'Personal Glossary', icon: BookOpen },
  ]

  const translationHistory = [
    { id: 1, from: 'Hello world', to: 'Hola mundo', fromLang: 'English', toLang: 'Spanish', date: '2025-08-12' },
    { id: 2, from: 'Good morning', to: 'Bonjour', fromLang: 'English', toLang: 'French', date: '2025-08-11' },
    { id: 3, from: 'Thank you', to: 'Danke', fromLang: 'English', toLang: 'German', date: '2025-08-10' },
  ]

  const personalGlossary = [
    { term: 'API', definition: 'Application Programming Interface', language: 'English' },
    { term: 'Machine Learning', definition: 'AI technique for pattern recognition', language: 'English' },
    { term: 'Accessibility', definition: 'Design for users with disabilities', language: 'English' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                  <select
                    value={userProfile.language}
                    onChange={(e) => setUserProfile({ ...userProfile, language: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility Level</label>
                  <select
                    value={userProfile.accessibilityLevel}
                    onChange={(e) => setUserProfile({ ...userProfile, accessibilityLevel: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Basic</option>
                    <option>Standard</option>
                    <option>Enhanced</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userProfile.notifications}
                    onChange={(e) => setUserProfile({ ...userProfile, notifications: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  <span className="text-sm text-gray-700">Enable notifications</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Translation Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Source Language</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Auto-detect</option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Translation Quality</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Fast</option>
                    <option>Balanced</option>
                    <option>High Quality</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accessibility Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voice Speed</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    defaultValue="1.0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">High Contrast Mode</label>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'history':
        return (
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Translation History</h3>
                <div className="flex space-x-2">
                  <button className="btn-secondary">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button className="btn-secondary text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {translationHistory.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            {item.fromLang} → {item.toLang}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">{item.from}</p>
                        <p className="text-gray-600">{item.to}</p>
                      </div>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'glossary':
        return (
          <div className="space-y-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Personal Glossary</h3>
                <button className="btn-primary">Add Term</button>
              </div>
              <div className="space-y-3">
                {personalGlossary.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.term}</h4>
                        <p className="text-gray-600">{item.definition}</p>
                        <span className="text-sm text-gray-500">{item.language}</span>
                      </div>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">User Profile</h1>
        <p className="text-lg text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default Profile

