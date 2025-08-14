import React, { useState, useRef } from 'react';

interface DetectedObject {
  id: string;
  name: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

const ObjectDetector: React.FC = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setDetectedObjects([]);
    }
  };

  const detectObjects = async () => {
    if (!imageUrl) return;

    setIsDetecting(true);
    try {
      // Simulate object detection API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock detected objects
      const mockObjects: DetectedObject[] = [
        {
          id: '1',
          name: 'person',
          confidence: 0.95,
          bbox: [100, 100, 200, 400]
        },
        {
          id: '2',
          name: 'chair',
          confidence: 0.87,
          bbox: [300, 300, 150, 200]
        },
        {
          id: '3',
          name: 'table',
          confidence: 0.92,
          bbox: [200, 400, 300, 100]
        }
      ];
      
      setDetectedObjects(mockObjects);
    } catch (error) {
      console.error('Object detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCameraCapture = () => {
    // This would integrate with device camera
    alert('Camera capture functionality would be implemented here');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Object Detection</h2>
        
        {/* Upload Section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              📁 Upload Image
            </button>
            <button
              onClick={handleCameraCapture}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              📷 Use Camera
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Image Display */}
        {imageUrl && (
          <div className="mb-6">
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Uploaded image"
                className="max-w-full h-auto rounded-lg border-2 border-gray-200"
              />
              
              {/* Detection Overlay */}
              {detectedObjects.map((obj) => (
                <div
                  key={obj.id}
                  className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
                  style={{
                    left: obj.bbox[0],
                    top: obj.bbox[1],
                    width: obj.bbox[2],
                    height: obj.bbox[3]
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-1 rounded text-sm">
                    {obj.name} ({Math.round(obj.confidence * 100)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detection Controls */}
        {imageUrl && (
          <div className="mb-6">
            <button
              onClick={detectObjects}
              disabled={isDetecting}
              className={`px-6 py-3 rounded-md text-white font-medium transition-colors ${
                isDetecting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isDetecting ? '🔍 Detecting...' : '🔍 Detect Objects'}
            </button>
          </div>
        )}

        {/* Results */}
        {detectedObjects.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Objects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detectedObjects.map((obj) => (
                <div key={obj.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">{obj.name}</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(obj.confidence * 100)}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Position: ({obj.bbox[0]}, {obj.bbox[1]})
                  </div>
                  <div className="text-sm text-gray-600">
                    Size: {obj.bbox[2]} × {obj.bbox[3]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!imageUrl && (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">Upload an image to get started</h3>
            <p className="text-gray-400">
              Use the upload button above to select an image file, or use your camera to capture a new image.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectDetector;
