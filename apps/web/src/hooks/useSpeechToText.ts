import { useMutation } from '@tanstack/react-query'
import { speechApi } from '../services/api'

export function useSpeechToText() {
  const transcribeMutation = useMutation({
    mutationFn: speechApi.speechToText,
  })

  const transcribeAudio = async (audioBlob: Blob, language: string = 'auto') => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')
    formData.append('language', language)
    formData.append('model', 'whisper')
    formData.append('timestamping', 'false')

    return transcribeMutation.mutateAsync(formData)
  }

  return {
    transcribeAudio,
    isLoading: transcribeMutation.isPending,
    error: transcribeMutation.error,
  }
}

export function useTextToSpeech() {
  const synthesizeMutation = useMutation({
    mutationFn: speechApi.textToSpeech,
  })

  const synthesizeSpeech = async (text: string, language: string, options?: {
    voice?: string
    speed?: number
    pitch?: number
    volume?: number
  }) => {
    return synthesizeMutation.mutateAsync({
      text,
      language,
      voice: options?.voice || 'default',
      speed: options?.speed || 1.0,
      pitch: options?.pitch || 1.0,
      volume: options?.volume || 1.0,
    })
  }

  return {
    synthesizeSpeech,
    isLoading: synthesizeMutation.isPending,
    error: synthesizeMutation.error,
  }
}