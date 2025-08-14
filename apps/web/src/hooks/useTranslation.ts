import { useMutation, useQuery } from '@tanstack/react-query'
import { translationApi } from '../services/api'
import type { TranslationRequest, TranslationResponse } from '@shared/types'

export function useTranslation() {
  const translateMutation = useMutation({
    mutationFn: translationApi.translateText,
    onError: (error) => {
      console.error('Translation error:', error)
    }
  })

  const { data: supportedLanguages } = useQuery({
    queryKey: ['supportedLanguages'],
    queryFn: translationApi.getSupportedLanguages,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })

  const translateText = async (request: TranslationRequest): Promise<TranslationResponse> => {
    return translateMutation.mutateAsync(request)
  }

  return {
    translateText,
    supportedLanguages: supportedLanguages?.languages || [],
    isLoading: translateMutation.isPending,
    error: translateMutation.error,
  }
}

export function useBatchTranslation() {
  const batchTranslateMutation = useMutation({
    mutationFn: translationApi.batchTranslate,
  })

  return {
    batchTranslate: batchTranslateMutation.mutateAsync,
    isLoading: batchTranslateMutation.isPending,
    error: batchTranslateMutation.error,
  }
}

export function useLanguageDetection() {
  const detectLanguageMutation = useMutation({
    mutationFn: translationApi.detectLanguage,
  })

  return {
    detectLanguage: detectLanguageMutation.mutateAsync,
    isLoading: detectLanguageMutation.isPending,
    error: detectLanguageMutation.error,
  }
}