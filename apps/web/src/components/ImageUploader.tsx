import { useState, useRef } from 'react'
import { CameraIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { useOCR } from '../hooks/useOCR'
import { useTranslation } from '../hooks/useTranslation'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  sourceLanguage: string
  targetLanguage: string
  onTranslation: (result: { originalText: string; translatedText: string }) => void
}

export function ImageUploader({ sourceLanguage, targetLanguage, onTranslation }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [ocrQuality, setOcrQuality] = useState<'fast' | 'accurate'>('accurate')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const { extractText } = useOCR()
  const { translateText } = useTranslation()

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

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraOpen(true)
      }
    } catch (error) {
      toast.error('Could not access camera')
      console.error('Camera access error:', error)
    }
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
            setSelectedImage(file)
            setImagePreview(canvas.toDataURL())
            closeCamera()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      setIsCameraOpen(false)
    }
  }

  const processImage = async () => {
    if (!selectedImage) return

    setIsProcessing(true)
    try {
      // Extract text using OCR
      const ocrResult = await extractText(selectedImage, sourceLanguage, ocrQuality)
      setExtractedText(ocrResult.text)

      // Translate extracted text
      if (ocrResult.text.trim()) {
        const translationResult = await translateText({
          text: ocrResult.text,
          sourceLanguage,
          targetLanguage
        })

        onTranslation({
          originalText: ocrResult.text,
          translatedText: translationResult.translatedText
        })

        toast.success('Image processed and translated!')
      } else {
        toast.warning('No text found in image')
      }
    } catch (error) {
      toast.error('Failed to process image')
      console.error('Image processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <PhotoIcon className="w-8 h-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Image
          </span>
        </button>

        <button
          onClick={openCamera}
          className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <CameraIcon className="w-8 h-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Take Photo
          </span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <DocumentIcon className="w-8 h-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Document
          </span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Camera View */}
      {isCameraOpen && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
            <button
              onClick={captureImage}
              className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <CameraIcon className="w-6 h-6" />
            </button>
            <button
              onClick={closeCamera}
              className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
            >
              <StopIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Image Preview */}
      {imagePreview && (
        <div className="space-y-4">
          <div>
            <label className="form-label">Selected Image</label>
            <img
              src={imagePreview}
              alt="Selected for OCR"
              className="w-full max-w-md mx-auto rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* OCR Quality Selection */}
          <div>
            <label className="form-label">OCR Quality</label>
            <select
              value={ocrQuality}
              onChange={(e) => setOcrQuality(e.target.value as 'fast' | 'accurate')}
              className="input-field"
            >
              <option value="fast">Fast (Lower accuracy, faster processing)</option>
              <option value="accurate">Accurate (Higher accuracy, slower processing)</option>
            </select>
          </div>

          <button
            onClick={processImage}
            disabled={isProcessing}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Image...
              </>
            ) : (
              'Extract & Translate Text'
            )}
          </button>
        </div>
      )}

      {/* Extracted Text */}
      {extractedText && (
        <div>
          <label className="form-label">Extracted Text</label>
          <div className="input-field bg-gray-50 dark:bg-gray-700 min-h-[100px]">
            {extractedText}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Image Translation Tips:
        </h3>
        <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1 list-disc list-inside">
          <li>Ensure good lighting and clear text visibility</li>
          <li>Hold the camera steady for better OCR accuracy</li>
          <li>Use "Accurate" mode for handwritten text</li>
          <li>Supported formats: JPG, PNG, PDF</li>
        </ul>
      </div>
    </div>
  )
}