import React, { useState, useRef } from 'react';

interface NavigationStep {
  id: string;
  instruction: string;
  distance: string;
  direction: string;
  landmark?: string;
}

interface Location {
  name: string;
  coordinates: [number, number];
  description: string;
}

const NavigationAssistant: React.FC = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [navigationSteps, setNavigationSteps] = useState<NavigationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');

  const availableDestinations: Location[] = [
    {
      name: 'Main Entrance',
      coordinates: [40.7128, -74.0060],
      description: 'Front door of the building'
    },
    {
      name: 'Cafeteria',
      coordinates: [40.7129, -74.0061],
      description: 'Food court and dining area'
    },
    {
      name: 'Conference Room A',
      coordinates: [40.7127, -74.0059],
      description: 'Meeting room on the first floor'
    },
    {
      name: 'Elevator',
      coordinates: [40.7128, -74.0060],
      description: 'Main elevator lobby'
    },
    {
      name: 'Restroom',
      coordinates: [40.7126, -74.0058],
      description: 'Public restroom facilities'
    }
  ];

  const startNavigation = () => {
    if (!currentLocation || !destination) {
      alert('Please select both current location and destination');
      return;
    }

    setIsNavigating(true);
    setCurrentStep(0);
    
    // Generate mock navigation steps
    const mockSteps: NavigationStep[] = [
      {
        id: '1',
        instruction: 'Turn right and walk forward',
        distance: '5 meters',
        direction: 'Right',
        landmark: 'Exit sign'
      },
      {
        id: '2',
        instruction: 'Continue straight down the hallway',
        distance: '15 meters',
        direction: 'Forward',
        landmark: 'Water fountain'
      },
      {
        id: '3',
        instruction: 'Turn left at the intersection',
        distance: '3 meters',
        direction: 'Left',
        landmark: 'Information desk'
      },
      {
        id: '4',
        instruction: 'Walk straight to your destination',
        distance: '8 meters',
        direction: 'Forward',
        landmark: 'Destination sign'
      }
    ];
    
    setNavigationSteps(mockSteps);
    speakInstruction(mockSteps[0]);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setNavigationSteps([]);
    setCurrentStep(0);
    setVoiceFeedback('');
  };

  const nextStep = () => {
    if (currentStep < navigationSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      speakInstruction(navigationSteps[nextStepIndex]);
    } else {
      // Navigation complete
      setVoiceFeedback('You have arrived at your destination!');
      setTimeout(() => {
        stopNavigation();
      }, 3000);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      speakInstruction(navigationSteps[prevStepIndex]);
    }
  };

  const speakInstruction = (step: NavigationStep) => {
    const instruction = `${step.instruction}. ${step.distance} ${step.direction}. ${step.landmark ? `Look for ${step.landmark}` : ''}`;
    setVoiceFeedback(instruction);
    
    // Simulate text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(instruction);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const repeatInstruction = () => {
    if (navigationSteps[currentStep]) {
      speakInstruction(navigationSteps[currentStep]);
    }
  };

  const startVoiceNavigation = () => {
    setIsListening(true);
    setVoiceFeedback('Listening for voice commands...');
    
    // Simulate voice recognition
    setTimeout(() => {
      const commands = [
        'next step',
        'repeat instruction',
        'stop navigation',
        'where am i'
      ];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      
      setVoiceFeedback(`Heard: "${randomCommand}"`);
      
      // Process command
      switch (randomCommand) {
        case 'next step':
          nextStep();
          break;
        case 'repeat instruction':
          repeatInstruction();
          break;
        case 'stop navigation':
          stopNavigation();
          break;
        case 'where am i':
          setVoiceFeedback('You are currently at step ' + (currentStep + 1) + ' of ' + navigationSteps.length);
          break;
      }
      
      setIsListening(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Navigation Assistant</h2>
        
        {/* Navigation Setup */}
        {!isNavigating && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <select
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your current location</option>
                  <option value="lobby">Main Lobby</option>
                  <option value="parking">Parking Lot</option>
                  <option value="entrance">Building Entrance</option>
                  <option value="floor1">First Floor</option>
                  <option value="floor2">Second Floor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your destination</option>
                  {availableDestinations.map((dest) => (
                    <option key={dest.name} value={dest.name}>
                      {dest.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={startNavigation}
              disabled={!currentLocation || !destination}
              className={`w-full px-6 py-3 rounded-md text-white font-medium transition-colors ${
                !currentLocation || !destination
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              🧭 Start Navigation
            </button>
          </div>
        )}

        {/* Active Navigation */}
        {isNavigating && navigationSteps.length > 0 && (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-blue-900">
                  Navigating to: {destination}
                </h3>
                <button
                  onClick={stopNavigation}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                >
                  Stop Navigation
                </button>
              </div>
              <p className="text-sm text-blue-700">
                Step {currentStep + 1} of {navigationSteps.length}
              </p>
            </div>

            {/* Current Step */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-4xl mb-4">🧭</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {navigationSteps[currentStep]?.instruction}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-sm text-gray-500">Distance</span>
                    <p className="font-medium">{navigationSteps[currentStep]?.distance}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Direction</span>
                    <p className="font-medium">{navigationSteps[currentStep]?.direction}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Landmark</span>
                    <p className="font-medium">{navigationSteps[currentStep]?.landmark || 'None'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-md font-medium ${
                  currentStep === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                ← Previous
              </button>
              
              <button
                onClick={repeatInstruction}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                🔄 Repeat
              </button>
              
              <button
                onClick={nextStep}
                disabled={currentStep === navigationSteps.length - 1}
                className={`px-4 py-2 rounded-md font-medium ${
                  currentStep === navigationSteps.length - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Next →
              </button>
            </div>

            {/* Voice Navigation */}
            <div className="text-center">
              <button
                onClick={startVoiceNavigation}
                disabled={isListening}
                className={`px-6 py-3 rounded-md font-medium ${
                  isListening
                    ? 'bg-yellow-500 text-white animate-pulse'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isListening ? '🎤 Listening...' : '🎤 Voice Navigation'}
              </button>
            </div>
          </div>
        )}

        {/* Voice Feedback */}
        {voiceFeedback && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-green-400">🔊</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  <strong>Voice Feedback:</strong> {voiceFeedback}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tips */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">🧭 Navigation Tips</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Use voice commands like "next step" or "repeat instruction"</li>
            <li>• Pay attention to landmarks mentioned in the instructions</li>
            <li>• The assistant will guide you step by step to your destination</li>
            <li>• You can pause or stop navigation at any time</li>
            <li>• For accessibility, all instructions are provided audibly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavigationAssistant;
