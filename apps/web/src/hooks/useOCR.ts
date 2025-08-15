import { useMutation } from '@tanstack/react-query'
import { ocrApi } from '../services/api'

export function useOCR() {
  const extractTextMutation = useMutation({
    mutationFn: ocrApi.extractText,
  })

  const batchExtractMutation = useMutation({
    mutationFn: ocrApi.batchExtract,
  })

  const extractText = async (
    imageFile: File, 
    language: string = 'auto',
    quality: 'fast' | 'accurate' = 'accurate'
  ) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('language', language)
    formData.append('model', quality === 'accurate' ? 'paddle' : 'tesseract')
    formData.append('confidence_threshold', '0.7')

    return extractTextMutation.mutateAsync(formData)
  }

  const batchExtract = async (imageFiles: File[], language: string = 'auto') => {
    const formData = new FormData()
    imageFiles.forEach((file, index) => {
      formData.append(`images`, file)
    })
    formData.append('language', language)

    return batchExtractMutation.mutateAsync(formData as any)
  }

  return {
    extractText,
    batchExtract,
    isLoading: extractTextMutation.isPending || batchExtractMutation.isPending,
    error: extractTextMutation.error || batchExtractMutation.error,
  }
}