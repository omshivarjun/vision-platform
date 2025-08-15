import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDND } from '../contexts/DNDContext';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  joinDate: string;
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
    accessibility: boolean;
  };
  stats: {
    translations: number;
    aiRequests: number;
    lastActive: string;
  };
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isDNDEnabled, setDNDEnabled, dndSettings, updateDNSSettings } = useDND();

  useEffect(() => {
    // Simulate loading user profile
    const loadProfile = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user profile data
        const mockProfile: UserProfile = {
          id: '1',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@vision.com',
          avatar: '👤',
          joinDate: '2024-01-15',
          preferences: {
            language: 'English',
            theme: 'Light',
            notifications: true,
            accessibility: true
          },
          stats: {
            translations: 1247,
            aiRequests: 892,
            lastActive: '2024-08-14 18:00'
          }
        };
        
        setProfile(mockProfile);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSavePreferences = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      alert('Preferences saved successfully!');
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600">Manage your account and preferences</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">{profile.avatar}</div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Member since {new Date(profile.joinDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Translations</span>
                      <span className="font-medium">{profile.stats.translations.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Requests</span>
                      <span className="font-medium">{profile.stats.aiRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Active</span>
                      <span className="font-medium text-sm">
                        {new Date(profile.stats.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Preferences</h3>
                
                <div className="space-y-6">
                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Language
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={profile.preferences.language}
                      >
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Chinese</option>
                        <option>Japanese</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile.preferences.language}</p>
                    )}
                  </div>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        defaultValue={profile.preferences.theme}
                      >
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Auto</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{profile.preferences.theme}</p>
                    )}
                  </div>

                  {/* Notifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notifications
                    </label>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        defaultChecked={profile.preferences.notifications}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.preferences.notifications ? 'Enabled' : 'Disabled'}
                      </p>
                    )}
                  </div>

                  {/* Accessibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accessibility Features
                    </label>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        defaultChecked={profile.preferences.accessibility}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile.preferences.accessibility ? 'Enabled' : 'Disabled'}
                      </p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSavePreferences}
                      disabled={isLoading}
                      className={`w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                )}
              </div>

              {/* DND Settings */}
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Do Not Disturb Settings</h3>
                
                <div className="space-y-6">
                  {/* DND Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Do Not Disturb Mode</h4>
                      <p className="text-sm text-gray-600">Silence notifications and interruptions</p>
                    </div>
                    <button
                      onClick={() => setDNDEnabled(!isDNDEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDNDEnabled ? 'bg-red-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDNDEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* DND Options */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Suppress Notifications
                      </label>
                      <input
                        type="checkbox"
                        checked={dndSettings.suppressNotifications}
                        onChange={(e) => updateDNSSettings({ suppressNotifications: e.target.checked })}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Suppress Sounds
                      </label>
                      <input
                        type="checkbox"
                        checked={dndSettings.suppressSounds}
                        onChange={(e) => updateDNSSettings({ suppressSounds: e.target.checked })}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Suppress Visual Alerts
                      </label>
                      <input
                        type="checkbox"
                        checked={dndSettings.suppressVisualAlerts}
                        onChange={(e) => updateDNSSettings({ suppressVisualAlerts: e.target.checked })}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-700">Quiet Hours</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={dndSettings.quietHours.start}
                          onChange={(e) => updateDNSSettings({ 
                            quietHours: { ...dndSettings.quietHours, start: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input
                          type="time"
                          value={dndSettings.quietHours.end}
                          onChange={(e) => updateDNSSettings({ 
                            quietHours: { ...dndSettings.quietHours, end: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auto-disable Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-disable at (optional)
                    </label>
                    <input
                      type="time"
                      value={dndSettings.autoDisableAt || ''}
                      onChange={(e) => updateDNSSettings({ 
                        autoDisableAt: e.target.value || null
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Leave empty for manual control"
                    />
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white shadow rounded-lg p-6 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Security</h3>
                
                <div className="space-y-4">
                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Connected Devices</h4>
                        <p className="text-sm text-gray-600">Manage your active sessions</p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
