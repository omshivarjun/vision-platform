import axios from 'axios'

// Define types locally to avoid import issues
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

interface BatchTranslationRequest {
  texts: string[]
  sourceLanguage: string
  targetLanguage: string
}

interface LanguageDetectionRequest {
  text: string
  confidenceThreshold?: number
}

const API_BASE_URL = 'http://localhost:3001'
const AI_BASE_URL = 'http://localhost:8000'

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
  }
}

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  },

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile')
    return response.data
  },

  async updateProfile(userData: any) {
    const response = await apiClient.put('/auth/profile', userData)
    return response.data
  }
}

// OCR API
export const ocrApi = {
  async extractText(formData: FormData) {
    const response = await aiClient.post('/ai/ocr/extract-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

// Object Detection API
export const objectDetectionApi = {
  async detectObjects(formData: FormData) {
    const response = await aiClient.post('/ai/vision/detect-objects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async analyzeScene(formData: FormData) {
    const response = await aiClient.post('/ai/vision/analyze-scene', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}