import React, { useState } from 'react';

interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  voiceSpeed: 'slow' | 'normal' | 'fast';
  voiceType: 'male' | 'female' | 'neutral';
  autoRead: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}

const AccessibilitySettings: React.FC = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReader: true,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    colorBlindness: 'none',
    voiceSpeed: 'normal',
    voiceType: 'female',
    autoRead: false,
    keyboardNavigation: true,
    focusIndicators: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for demo
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
      
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings: AccessibilitySettings = {
      screenReader: true,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      colorBlindness: 'none',
      voiceSpeed: 'normal',
      voiceType: 'female',
      autoRead: false,
      keyboardNavigation: true,
      focusIndicators: true
    };
    setSettings(defaultSettings);
  };

  const applySettings = () => {
    // Apply visual changes based on settings
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (settings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    if (settings.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }

    // Apply color blindness filter
    document.documentElement.style.filter = settings.colorBlindness !== 'none' 
      ? `url(#${settings.colorBlindness})` 
      : 'none';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Accessibility Settings</h2>
        
        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visual Accessibility */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👁️ Visual Accessibility</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">High Contrast Mode</label>
                  <p className="text-xs text-gray-500">Increase contrast for better visibility</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Large Text</label>
                  <p className="text-xs text-gray-500">Increase font size throughout the app</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.largeText}
                  onChange={(e) => handleSettingChange('largeText', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Reduced Motion</label>
                  <p className="text-xs text-gray-500">Minimize animations and transitions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Blindness Support</label>
                <select
                  value={settings.colorBlindness}
                  onChange={(e) => handleSettingChange('colorBlindness', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">No color blindness</option>
                  <option value="protanopia">Protanopia (Red-Blind)</option>
                  <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                  <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audio Accessibility */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔊 Audio Accessibility</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Screen Reader</label>
                  <p className="text-xs text-gray-500">Enable screen reader support</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.screenReader}
                  onChange={(e) => handleSettingChange('screenReader', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-Read Content</label>
                  <p className="text-xs text-gray-500">Automatically read new content</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRead}
                  onChange={(e) => handleSettingChange('autoRead', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice Speed</label>
                <select
                  value={settings.voiceSpeed}
                  onChange={(e) => handleSettingChange('voiceSpeed', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice Type</label>
                <select
                  value={settings.voiceType}
                  onChange={(e) => handleSettingChange('voiceType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Accessibility */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🧭 Navigation Accessibility</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Keyboard Navigation</label>
                <p className="text-xs text-gray-500">Enable full keyboard navigation</p>
              </div>
              <input
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => handleSettingChange('keyboardNavigation', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Focus Indicators</label>
                <p className="text-xs text-gray-500">Show clear focus indicators</p>
              </div>
              <input
                type="checkbox"
                checked={settings.focusIndicators}
                onChange={(e) => handleSettingChange('focusIndicators', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Quick Test */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">🧪 Quick Test</h3>
          <p className="text-sm text-blue-800 mb-4">
            Test your accessibility settings with sample content
          </p>
          <div className="flex space-x-3">
            <button
              onClick={applySettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Apply Settings
            </button>
            <button
              onClick={() => {
                // Simulate reading content
                if (settings.screenReader) {
                  const utterance = new SpeechSynthesisUtterance(
                    "This is a test of the screen reader functionality. If you can hear this, the audio accessibility is working correctly."
                  );
                  utterance.rate = settings.voiceSpeed === 'slow' ? 0.7 : settings.voiceSpeed === 'fast' ? 1.3 : 1.0;
                  speechSynthesis.speak(utterance);
                }
              }}
              disabled={!settings.screenReader}
              className={`px-4 py-2 rounded-md text-sm ${
                settings.screenReader
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Test Screen Reader
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className={`flex-1 px-6 py-3 rounded-md font-medium ${
              isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button
            onClick={resetToDefaults}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Accessibility Tips */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-900 mb-2">💡 Accessibility Tips</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Use high contrast mode in bright lighting conditions</li>
            <li>• Enable large text if you have difficulty reading small fonts</li>
            <li>• Turn on reduced motion if animations cause discomfort</li>
            <li>• Use keyboard navigation for faster access (Tab, Enter, Space, Arrow keys)</li>
            <li>• Test settings with the quick test buttons above</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
