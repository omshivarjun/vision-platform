import { useMutation, useQuery } from '@tanstack/react-query'
import { translationApi } from '../services/api'

// Define types locally
interface TranslationRequest {
  text: string
  sourceLanguage: string
  targetLanguage: string
  quality?: string
}

interface TranslationResponse {
  translatedText: string
  confidence: number
  detectedLanguage?: string
}

export function useTranslation() {
  const translateMutation = useMutation({
    mutationFn: (request: TranslationRequest) => translationApi.translateText(request),
  })

  const batchTranslateMutation = useMutation({
    mutationFn: (request: { texts: string[]; sourceLanguage: string; targetLanguage: string }) =>
      translationApi.batchTranslate(request),
  })

  const detectLanguageMutation = useMutation({
    mutationFn: (request: { text: string; confidenceThreshold?: number }) =>
      translationApi.detectLanguage(request),
  })

  const supportedLanguagesQuery = useQuery({
    queryKey: ['supportedLanguages'],
    queryFn: () => translationApi.getSupportedLanguages(),
  })

  const translationModelsQuery = useQuery({
    queryKey: ['translationModels'],
    queryFn: () => translationApi.getTranslationModels(),
  })

  return {
    // Main translation function that TranslationPage expects
    translateText: (request: TranslationRequest) => translateMutation.mutateAsync(request),
    isLoading: translateMutation.isPending,
    
    // Original mutation functions
    translate: translateMutation.mutate,
    translateAsync: translateMutation.mutateAsync,
    isTranslating: translateMutation.isPending,
    translationError: translateMutation.error,
    translationResult: translateMutation.data,

    batchTranslate: batchTranslateMutation.mutate,
    batchTranslateAsync: batchTranslateMutation.mutateAsync,
    isBatchTranslating: batchTranslateMutation.isPending,
    batchTranslationError: batchTranslateMutation.error,
    batchTranslationResult: batchTranslateMutation.data,

    detectLanguage: detectLanguageMutation.mutate,
    detectLanguageAsync: detectLanguageMutation.mutateAsync,
    isDetectingLanguage: detectLanguageMutation.isPending,
    languageDetectionError: detectLanguageMutation.error,
    languageDetectionResult: detectLanguageMutation.data,

    supportedLanguages: supportedLanguagesQuery.data,
    isSupportedLanguagesLoading: supportedLanguagesQuery.isLoading,
    supportedLanguagesError: supportedLanguagesQuery.error,

    translationModels: translationModelsQuery.data,
    isTranslationModelsLoading: translationModelsQuery.isLoading,
    translationModelsError: translationModelsQuery.error,
  }
}