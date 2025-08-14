import React, { useState, useRef } from 'react';

const OCRReader: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState<string[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setError('');
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setOcrResults([]);
    }
  };

  const processImage = async () => {
    if (!imageUrl) return;
    setIsProcessing(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResults = [
        'Welcome to Vision Platform',
        'AI-Powered Accessibility',
        'Real-time Translation',
        'Object Detection'
      ];
      setOcrResults(mockResults);
    } catch (error) {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const readText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const clearResults = () => {
    setImageUrl(null);
    setOcrResults([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">OCR Text Reader</h2>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📷 Image Input</h3>
            
            <div className="mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
              >
                📁 Click to upload image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {imageUrl && (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Uploaded image for OCR"
                  className="w-full h-auto rounded-lg border-2 border-gray-200"
                />
              </div>
            )}

            <div className="mt-4 flex space-x-3">
              <button
                onClick={processImage}
                disabled={!imageUrl || isProcessing}
                className={`flex-1 px-4 py-2 rounded-md font-medium ${
                  !imageUrl || isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isProcessing ? '🔍 Processing...' : '🔍 Extract Text'}
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Extracted Text</h3>
            
            {ocrResults.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-medium mb-2">No text extracted yet</h3>
                <p className="text-gray-400">
                  Upload an image and click "Extract Text" to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    {ocrResults.length} text blocks detected
                  </p>
                </div>

                {ocrResults.map((text, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{text}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => readText(text)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Read text aloud"
                        >
                          🔊
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRReader;
