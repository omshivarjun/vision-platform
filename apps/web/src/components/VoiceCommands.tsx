import React, { useState, useRef } from 'react';

interface VoiceCommand {
  id: string;
  command: string;
  description: string;
  category: 'translation' | 'accessibility' | 'navigation' | 'general';
}

const VoiceCommands: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const availableCommands: VoiceCommand[] = [
    {
      id: '1',
      command: 'translate this',
      description: 'Translate the current text or image',
      category: 'translation'
    },
    {
      id: '2',
      command: 'what do you see',
      description: 'Describe the current scene or image',
      category: 'accessibility'
    },
    {
      id: '3',
      command: 'navigate to',
      description: 'Get navigation assistance to a location',
      category: 'navigation'
    },
    {
      id: '4',
      command: 'read this',
      description: 'Read aloud the current text',
      category: 'accessibility'
    },
    {
      id: '5',
      command: 'help me',
      description: 'Get assistance and available commands',
      category: 'general'
    },
    {
      id: '6',
      command: 'take a picture',
      description: 'Capture an image for analysis',
      category: 'accessibility'
    }
  ];

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    
    // Simulate speech recognition
    setTimeout(() => {
      const mockTranscript = 'translate this text to Spanish';
      setTranscript(mockTranscript);
      processCommand(mockTranscript);
    }, 2000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processCommand = async (command: string) => {
    setIsProcessing(true);
    setLastCommand(command);
    
    // Simulate command processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    
    // Show feedback based on command
    if (command.toLowerCase().includes('translate')) {
      alert('Translation feature activated! Please select text or image to translate.');
    } else if (command.toLowerCase().includes('see')) {
      alert('Scene analysis activated! Please point camera at the scene.');
    } else if (command.toLowerCase().includes('navigate')) {
      alert('Navigation assistance activated! Please specify destination.');
    } else if (command.toLowerCase().includes('read')) {
      alert('Text-to-speech activated! Please select text to read aloud.');
    } else if (command.toLowerCase().includes('picture')) {
      alert('Camera activated! Please position device for photo.');
    } else if (command.toLowerCase().includes('help')) {
      alert('Help system activated! Available commands: translate, see, navigate, read, picture');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'translation':
        return 'bg-blue-100 text-blue-800';
      case 'accessibility':
        return 'bg-green-100 text-green-800';
      case 'navigation':
        return 'bg-purple-100 text-purple-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'translation':
        return '🌍';
      case 'accessibility':
        return '♿';
      case 'navigation':
        return '🧭';
      case 'general':
        return '❓';
      default:
        return '❓';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Voice Commands</h2>
        
        {/* Voice Control Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : isProcessing
                  ? 'bg-yellow-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isListening ? '🛑' : isProcessing ? '⏳' : '🎤'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-2">
              {isListening 
                ? 'Listening... Speak your command' 
                : isProcessing 
                ? 'Processing your command...' 
                : 'Click the microphone to start voice commands'
              }
            </p>
            
            {transcript && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Heard:</strong> "{transcript}"
                </p>
              </div>
            )}
            
            {lastCommand && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Executed:</strong> "{lastCommand}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Available Commands */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Voice Commands</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableCommands.map((cmd) => (
              <div key={cmd.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <span className="text-2xl">{getCategoryIcon(cmd.category)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      "{cmd.command}"
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {cmd.description}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(cmd.category)}`}>
                      {cmd.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Settings */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Speed
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Slow</option>
                <option selected>Normal</option>
                <option>Fast</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Type
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Male</option>
                <option selected>Female</option>
                <option>Neutral</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option selected>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sensitivity
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Low</option>
                <option selected>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">💡 Voice Command Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Use simple, direct commands</li>
            <li>• Wait for the listening indicator before speaking</li>
            <li>• Use "help me" to learn available commands</li>
            <li>• Commands work best in quiet environments</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommands;
