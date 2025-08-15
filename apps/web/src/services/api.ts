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
    try {
      // Try to call the real API first
      const response = await aiClient.post('/ai/translation/translate', {
        text: request.text,
        source_lang: request.sourceLanguage,
        target_lang: request.targetLanguage,
        model: 'marian',
        quality: request.quality || 'standard'
      })
      return response.data
    } catch (error) {
      console.warn('Backend translation API not available, using mock service:', error)
      
      // Fallback to mock translation service
      return this.mockTranslateText(request)
    }
  },

  async batchTranslate(request: BatchTranslationRequest) {
    try {
      const response = await aiClient.post('/ai/translation/translate-batch', {
        texts: request.texts,
        source_lang: request.sourceLanguage,
        target_lang: request.targetLanguage,
        model: 'marian'
      })
      return response.data
    } catch (error) {
      console.warn('Backend batch translation API not available, using mock service:', error)
      
      // Fallback to mock batch translation
      const results = await Promise.all(
        request.texts.map(text => 
          this.mockTranslateText({
            text,
            sourceLanguage: request.sourceLanguage,
            targetLanguage: request.targetLanguage
          })
        )
      )
      return { translations: results }
    }
  },

  async detectLanguage(request: LanguageDetectionRequest) {
    try {
      const response = await aiClient.post('/ai/translation/detect-language', {
        text: request.text,
        confidence_threshold: request.confidenceThreshold || 0.8
      })
      return response.data
    } catch (error) {
      console.warn('Backend language detection API not available, using mock service:', error)
      
      // Fallback to mock language detection
      return this.mockDetectLanguage(request)
    }
  },

  async getSupportedLanguages() {
    try {
      const response = await aiClient.get('/ai/translation/supported-languages')
      return response.data
    } catch (error) {
      console.warn('Backend supported languages API not available, using mock service:', error)
      
      // Fallback to mock supported languages
      return this.mockGetSupportedLanguages()
    }
  },

  async getTranslationModels() {
    try {
      const response = await aiClient.get('/ai/translation/models')
      return response.data
    } catch (error) {
      console.warn('Backend translation models API not available, using mock service:', error)
      
      // Fallback to mock translation models
      return this.mockGetTranslationModels()
    }
  },

  // Mock translation service for development
  mockTranslateText(request: TranslationRequest): Promise<TranslationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple mock translation logic
        let translatedText = request.text
        
        // Mock translations for common phrases
        const mockTranslations: Record<string, Record<string, Record<string, string>>> = {
          'en': {
            'es': {
              'hello': 'hola',
              'goodbye': 'adiós',
              'thank you': 'gracias',
              'please': 'por favor',
              'how are you': '¿cómo estás?',
              'good morning': 'buenos días',
              'good night': 'buenas noches'
            },
            'fr': {
              'hello': 'bonjour',
              'goodbye': 'au revoir',
              'thank you': 'merci',
              'please': 's\'il vous plaît',
              'how are you': 'comment allez-vous?',
              'good morning': 'bonjour',
              'good night': 'bonne nuit'
            },
            'de': {
              'hello': 'hallo',
              'goodbye': 'auf wiedersehen',
              'thank you': 'danke',
              'please': 'bitte',
              'how are you': 'wie geht es dir?',
              'good morning': 'guten morgen',
              'good night': 'gute nacht'
            }
          }
        }

        // Check if we have a mock translation
        if (mockTranslations[request.sourceLanguage] && mockTranslations[request.sourceLanguage][request.targetLanguage]) {
          const lowerText = request.text.toLowerCase()
          for (const [english, translation] of Object.entries(mockTranslations[request.sourceLanguage][request.targetLanguage])) {
            if (lowerText.includes(english)) {
              translatedText = request.text.replace(new RegExp(english, 'gi'), translation)
              break
            }
          }
        } else {
          // Generic mock translation
          translatedText = `[${request.targetLanguage.toUpperCase()}] ${request.text}`
        }

        resolve({
          translatedText,
          confidence: 0.85,
          detectedLanguage: request.sourceLanguage
        })
      }, 1000) // Simulate API delay
    })
  },

  mockDetectLanguage(request: LanguageDetectionRequest) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple language detection based on common patterns
        const text = request.text.toLowerCase()
        let detectedLang = 'en'
        
        if (text.includes('hola') || text.includes('gracias') || text.includes('por favor')) {
          detectedLang = 'es'
        } else if (text.includes('bonjour') || text.includes('merci') || text.includes('oui')) {
          detectedLang = 'fr'
        } else if (text.includes('hallo') || text.includes('danke') || text.includes('bitte')) {
          detectedLang = 'de'
        } else if (text.includes('привет') || text.includes('спасибо')) {
          detectedLang = 'ru'
        } else if (text.includes('你好') || text.includes('谢谢')) {
          detectedLang = 'zh'
        } else if (text.includes('こんにちは') || text.includes('ありがとう')) {
          detectedLang = 'ja'
        }

        resolve({
          detectedLanguage: detectedLang,
          confidence: 0.9
        })
      }, 500)
    })
  },

  mockGetSupportedLanguages() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { code: 'en', name: 'English', flag: '🇺🇸' },
          { code: 'es', name: 'Spanish', flag: '🇪🇸' },
          { code: 'fr', name: 'French', flag: '🇫🇷' },
          { code: 'de', name: 'German', flag: '🇩🇪' },
          { code: 'it', name: 'Italian', flag: '🇮🇹' },
          { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
          { code: 'ru', name: 'Russian', flag: '🇷🇺' },
          { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
          { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
          { code: 'ko', name: 'Korean', flag: '🇰🇷' },
          { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
          { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
        ])
      }, 300)
    })
  },

  mockGetTranslationModels() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'marian', name: 'Marian MT', quality: 'high', supportedLanguages: ['en', 'es', 'fr', 'de'] },
          { id: 'opus', name: 'OPUS MT', quality: 'medium', supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt'] },
          { id: 'nllb', name: 'NLLB-200', quality: 'high', supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'] }
        ])
      }, 200)
    })
  },

  // Mock methods for Personal Glossary and Translation History
  async getTranslationMemory(request: { page: number; limit: number }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [],
          total: 0,
          page: request.page,
          limit: request.limit
        })
      }, 300)
    })
  },

  async addTranslationMemory(entry: any) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id: Date.now().toString() })
      }, 300)
    })
  },

  async deleteTranslationMemory(id: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 300)
    })
  },

  async getHistory(request: { page: number; limit: number }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [],
          total: 0,
          page: request.page,
          limit: request.limit
        })
      }, 300)
    })
  },

  async deleteHistoryItem(id: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 300)
    })
  },

  async favoriteHistoryItem(id: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 300)
    })
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
  },

  async batchExtract(formData: FormData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          results: [],
          total: 0
        })
      }, 1000)
    })
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

// Accessibility API
export const accessibilityApi = {
  async analyzeScene(formData: FormData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          description: 'A scene with various objects',
          objects: ['chair', 'table', 'window'],
          accessibility: 'Good lighting and clear pathways'
        })
      }, 1000)
    })
  },

  async detectObjects(formData: FormData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          objects: ['chair', 'table', 'window'],
          confidence: 0.9
        })
      }, 800)
    })
  }
}