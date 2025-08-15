import { useState, useRef } from 'react'
import { CameraIcon, PhotoIcon, EyeIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'
import { useSceneDescription } from '../hooks/useSceneDescription'
import toast from 'react-hot-toast'

export function SceneAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [sceneDescription, setSceneDescription] = useState('')
  const [detectedObjects, setDetectedObjects] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detailLevel, setDetailLevel] = useState<'basic' | 'detailed' | 'comprehensive'>('detailed')
  const [includeObjects, setIncludeObjects] = useState(true)
  const [includeText, setIncludeText] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { analyzeScene } = useSceneDescription()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeScene({
        image: selectedImage,
        detailLevel,
        includeObjects,
        includeText
      })

      setSceneDescription((result as any).description)
      setDetectedObjects((result as any).objects || [])
      toast.success('Scene analysis completed!')
    } catch (error) {
      toast.error('Failed to analyze scene')
      console.error('Scene analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const speakDescription = () => {
    if (sceneDescription && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sceneDescription)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <PhotoIcon className="w-12 h-12 text-gray-400" />
          <div className="text-center">
            <div className="font-medium text-gray-700 dark:text-gray-300">Upload Image</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG up to 10MB</div>
          </div>
        </button>

        <button
          onClick={() => {/* TODO: Implement camera capture */}}
          className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <CameraIcon className="w-12 h-12 text-gray-400" />
          <div className="text-center">
            <div className="font-medium text-gray-700 dark:text-gray-300">Take Photo</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Use camera</div>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Analysis Settings */}
      {selectedImage && (
        <div className="space-y-4">
          <div>
            <label className="form-label">Detail Level</label>
            <select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value as any)}
              className="input-field"
            >
              <option value="basic">Basic - Simple overview</option>
              <option value="detailed">Detailed - Comprehensive description</option>
              <option value="comprehensive">Comprehensive - Full analysis</option>
            </select>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeObjects}
                onChange={(e) => setIncludeObjects(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include object detection</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeText}
                onChange={(e) => setIncludeText(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include text extraction</span>
            </label>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="space-y-4">
          <div>
            <label className="form-label">Image Preview</label>
            <img
              src={imagePreview}
              alt="Scene to analyze"
              className="w-full max-w-lg mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>

          <button
            onClick={analyzeImage}
            disabled={isAnalyzing}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Analyzing Scene...
              </>
            ) : (
              <>
                <EyeIcon className="w-5 h-5 mr-2" />
                Analyze Scene
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {sceneDescription && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label">Scene Description</label>
              <button
                onClick={speakDescription}
                className="btn-outline py-1 px-3 text-sm"
              >
                <SpeakerWaveIcon className="w-4 h-4 mr-1" />
                Speak
              </button>
            </div>
            <div className="input-field bg-gray-50 dark:bg-gray-700 min-h-[120px]">
              {sceneDescription}
            </div>
          </div>

          {detectedObjects.length > 0 && (
            <div>
              <label className="form-label">Detected Objects</label>
              <div className="flex flex-wrap gap-2">
                {detectedObjects.map((object, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                  >
                    {object.name} ({Math.round(object.confidence * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
          Scene Analysis Features:
        </h3>
        <ul className="text-green-800 dark:text-green-200 text-sm space-y-1 list-disc list-inside">
          <li>Detailed natural language descriptions of scenes</li>
          <li>Object detection with confidence scores</li>
          <li>Text extraction from images and signs</li>
          <li>Spatial relationship information</li>
          <li>Audio playback of descriptions</li>
        </ul>
      </div>
    </div>
  )
}