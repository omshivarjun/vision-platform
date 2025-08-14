import { useMutation } from '@tanstack/react-query'
import { accessibilityApi } from '../services/api'

export function useSceneDescription() {
  const analyzeSceneMutation = useMutation({
    mutationFn: accessibilityApi.analyzeScene,
  })

  const analyzeScene = async (request: {
    image: File
    detailLevel: 'basic' | 'detailed' | 'comprehensive'
    includeObjects: boolean
    includeText: boolean
  }) => {
    const formData = new FormData()
    formData.append('image', request.image)
    formData.append('detail', request.detailLevel)
    formData.append('includeObjects', request.includeObjects.toString())
    formData.append('includeText', request.includeText.toString())

    return analyzeSceneMutation.mutateAsync(formData)
  }

  return {
    analyzeScene,
    isLoading: analyzeSceneMutation.isPending,
    error: analyzeSceneMutation.error,
  }
}

export function useObjectDetection() {
  const detectObjectsMutation = useMutation({
    mutationFn: accessibilityApi.detectObjects,
  })

  const detectObjects = async (image: File, confidence: number = 0.7) => {
    const formData = new FormData()
    formData.append('image', image)
    formData.append('confidence', confidence.toString())

    return detectObjectsMutation.mutateAsync(formData)
  }

  return {
    detectObjects,
    isLoading: detectObjectsMutation.isPending,
    error: detectObjectsMutation.error,
  }
}