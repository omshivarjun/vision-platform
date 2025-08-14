import React from 'react';

const ApiDocsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            API Documentation
          </h1>
          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Vision Platform API</h2>
              <p className="text-gray-600 mt-2">Complete API reference for developers</p>
            </div>
            
            <div className="p-6">
              {/* Authentication */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🔐 Authentication</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">All API requests require authentication using JWT tokens.</p>
                  <code className="text-sm bg-gray-800 text-green-400 px-2 py-1 rounded">
                    Authorization: Bearer &lt;your-jwt-token&gt;
                  </code>
                </div>
              </div>

              {/* Translation API */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🌍 Translation API</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-600">POST</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/v1/translation/text</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Translate text between languages</p>
                    <div className="text-xs text-gray-500">
                      <strong>Request:</strong> {"{"}text, sourceLang, targetLang{"}"}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600">POST</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/v1/translation/speech</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Speech-to-text translation</p>
                    <div className="text-xs text-gray-500">
                      <strong>Request:</strong> {"{"}audio, sourceLang, targetLang{"}"}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-600">POST</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/v1/translation/image</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">OCR and translate image text</p>
                    <div className="text-xs text-gray-500">
                      <strong>Request:</strong> {"{"}image, sourceLang, targetLang{"}"}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Services API */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🤖 AI Services API</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-600">POST</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/v1/ai/ocr</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Extract text from images</p>
                    <div className="text-xs text-gray-500">
                      <strong>Request:</strong> {"{"}image, language{"}"}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600">POST</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/v1/ai/object-detection</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Detect objects in images</p>
                    <div className="text-xs text-gray-500">
                      <strong>Request:</strong> {"{"}image{"}"}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-600">POST</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/v1/ai/scene-description</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Generate scene descriptions</p>
                    <div className="text-xs text-gray-500">
                      <strong>Request:</strong> {"{"}image, detail{"}"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accessibility API */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">♿ Accessibility API</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-600">POST</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/v1/accessibility/voice-command</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Process voice commands</p>
                    <div className="text-xs text-gray-500">
                      <strong>Request:</strong> {"{"}audio, command{"}"}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600">GET</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">/api/v1/accessibility/navigation</code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Get navigation assistance</p>
                    <div className="text-xs text-gray-500">
                      <strong>Query:</strong> {"{"}location, destination{"}"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rate Limits */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">⚡ Rate Limits</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Free Tier:</strong> 100 requests/hour<br/>
                    <strong>Pro Tier:</strong> 1,000 requests/hour<br/>
                    <strong>Enterprise:</strong> Custom limits
                  </p>
                </div>
              </div>

              {/* SDKs */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📚 SDKs & Libraries</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">JavaScript/TypeScript</h4>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
                      npm install @vision-platform/client
                    </code>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Python</h4>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
                      pip install vision-platform
                    </code>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">React Native</h4>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
                      npm install @vision-platform/react-native
                    </code>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Flutter</h4>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
                      flutter pub add vision_platform
                    </code>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">🆘 Support</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Documentation:</strong> <a href="http://localhost:8000/docs" className="underline">http://localhost:8000/docs</a><br/>
                    <strong>GitHub:</strong> <a href="https://github.com/vision-platform" className="underline">https://github.com/vision-platform</a><br/>
                    <strong>Discord:</strong> <a href="https://discord.gg/vision-platform" className="underline">https://discord.gg/vision-platform</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
