import axios from 'axios'
import type { 
  TranslationRequest, 
  TranslationResponse,
  BatchTranslationRequest,
  LanguageDetectionRequest 
} from '@shared/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const AI_BASE_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000'

// Create axios instances
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 60000,
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

aiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Translation API
export const translationApi = {
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    const response = await aiClient.post('/ai/translation/translate', {
      text: request.text,
      source_lang: request.sourceLanguage,
      target_lang: request.targetLanguage,
      model: 'marian',
      quality: request.quality || 'standard'
    })
    return response.data
  },

  async batchTranslate(request: BatchTranslationRequest) {
    const response = await aiClient.post('/ai/translation/translate-batch', {
      texts: request.texts,
      source_lang: request.sourceLanguage,
      target_lang: request.targetLanguage,
      model: 'marian'
    })
    return response.data
  },

  async detectLanguage(request: LanguageDetectionRequest) {
    const response = await aiClient.post('/ai/translation/detect-language', {
      text: request.text,
      confidence_threshold: request.confidenceThreshold || 0.8
    })
    return response.data
  },

  async getSupportedLanguages() {
    const response = await aiClient.get('/ai/translation/supported-languages')
    return response.data
  },

  async getTranslationModels() {
    const response = await aiClient.get('/ai/translation/models')
    return response.data
  }
}

// Speech API
export const speechApi = {
  async speechToText(formData: FormData) {
    const response = await aiClient.post('/ai/speech/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async textToSpeech(request: {
    text: string
    language: string
    voice?: string
    speed?: number
    pitch?: number
    volume?: number
  }) {
    const response = await aiClient.post('/ai/speech/text-to-speech', request)
    return response.data
  },

  async processVoiceCommand(formData: FormData) {
    const response = await aiClient.post('/ai/speech/voice-command', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async getSupportedLanguages() {
    const response = await aiClient.get('/ai/speech/supported-languages')
    return response.data
  },

  async getAvailableVoices() {
    const response = await aiClient.get('/ai/speech/voices')
    return response.data
  }
}

// OCR API
export const ocrApi = {
  async extractText(formData: FormData) {
    const response = await aiClient.post('/ai/ocr/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async batchExtract(formData: FormData) {
    const response = await aiClient.post('/ai/ocr/batch-extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async getSupportedLanguages() {
    const response = await aiClient.get('/ai/ocr/supported-languages')
    return response.data
  },

  async getModels() {
    const response = await aiClient.get('/ai/ocr/models')
    return response.data
  }
}

// Accessibility API
export const accessibilityApi = {
  async analyzeScene(formData: FormData) {
    const response = await aiClient.post('/ai/accessibility/scene-description', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async detectObjects(formData: FormData) {
    const response = await aiClient.post('/ai/accessibility/object-detection', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async getNavigation(request: {
    currentLocation: { latitude: number; longitude: number }
    destination: string
    mode: string
    accessibility: boolean
  }) {
    const response = await apiClient.post('/api/accessibility/navigation', request)
    return response.data
  },

  async processVoiceCommand(formData: FormData) {
    const response = await aiClient.post('/ai/accessibility/voice-command', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/api/auth/login', { email, password })
    return response.data
  },

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) {
    const response = await apiClient.post('/api/auth/register', userData)
    return response.data
  },

  async getProfile() {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },

  async updateProfile(userData: any) {
    const response = await apiClient.put('/api/users/profile', userData)
    return response.data
  },

  async refreshToken(refreshToken: string) {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken })
    return response.data
  }
}

// Health API
export const healthApi = {
  async getApiHealth() {
    const response = await apiClient.get('/health')
    return response.data
  },

  async getAiHealth() {
    const response = await aiClient.get('/health')
    return response.data
  }
}