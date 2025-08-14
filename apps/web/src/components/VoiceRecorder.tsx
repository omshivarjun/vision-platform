import { useState, useRef, useEffect } from 'react'
import { MicrophoneIcon, StopIcon, PlayIcon } from '@heroicons/react/24/outline'
import { useSpeechToText } from '../hooks/useSpeechToText'
import { useTranslation } from '../hooks/useTranslation'
import toast from 'react-hot-toast'

interface VoiceRecorderProps {
  sourceLanguage: string
  targetLanguage: string
  onTranslation: (result: { originalText: string; translatedText: string }) => void
}

export function VoiceRecorder({ sourceLanguage, targetLanguage, onTranslation }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const { transcribeAudio } = useSpeechToText()
  const { translateText } = useTranslation()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success('Recording started')
    } catch (error) {
      toast.error('Could not access microphone')
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      toast.success('Recording stopped')
    }
  }

  const processAudio = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    try {
      // Convert audio to text
      const transcriptionResult = await transcribeAudio(audioBlob, sourceLanguage)
      setTranscription(transcriptionResult.text)

      // Translate the transcription
      const translationResult = await translateText({
        text: transcriptionResult.text,
        sourceLanguage,
        targetLanguage
      })

      onTranslation({
        originalText: transcriptionResult.text,
        translatedText: translationResult.translatedText
      })

      toast.success('Speech processed and translated!')
    } catch (error) {
      toast.error('Failed to process audio')
      console.error('Audio processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const playAudio = () => {
    if (audioBlob) {
      const audio = new Audio(URL.createObjectURL(audioBlob))
      audio.play()
    }
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="text-center">
        <div className="mb-6">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}>
            {isRecording ? (
              <StopIcon className="w-12 h-12 text-white" />
            ) : (
              <MicrophoneIcon className="w-12 h-12 text-white" />
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="btn-primary px-6 py-3"
              disabled={isProcessing}
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Stop Recording
            </button>
          )}

          {audioBlob && (
            <button
              onClick={playAudio}
              className="btn-outline px-6 py-3"
              disabled={isRecording}
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              Play
            </button>
          )}
        </div>
      </div>

      {/* Audio Processing */}
      {audioBlob && !transcription && (
        <div className="text-center">
          <button
            onClick={processAudio}
            disabled={isProcessing}
            className="btn-primary px-8 py-3 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Process & Translate'
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {transcription && (
        <div className="space-y-4">
          <div>
            <label className="form-label">Transcription</label>
            <div className="input-field bg-gray-50 dark:bg-gray-700">
              {transcription}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          How to use Voice Translation:
        </h3>
        <ol className="text-blue-800 dark:text-blue-200 text-sm space-y-1 list-decimal list-inside">
          <li>Click "Start Recording" and speak clearly</li>
          <li>Click "Stop Recording" when finished</li>
          <li>Click "Process & Translate" to convert speech to text and translate</li>
          <li>Use the play button to hear your recording</li>
        </ol>
      </div>
    </div>
  )
}