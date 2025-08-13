import { describe, it, expect } from '@jest/globals'
import { z } from 'zod'
import {
  // Auth types
  LoginRequestSchema,
  RegisterRequestSchema,
  AuthResponseSchema,
  RefreshTokenRequestSchema,
  ChangePasswordRequestSchema,
  JWTPayload,
  PermissionSchema,
  
  // Translation types
  TranslationRequestSchema,
  TranslationResponseSchema,
  BatchTranslationRequestSchema,
  SpeechTranslationRequestSchema,
  ImageTranslationRequestSchema,
  TranslationMemoryEntrySchema,
  LanguageDetectionRequestSchema,
  
  // Accessibility types
  SceneDescriptionRequestSchema,
  ObjectDetectionRequestSchema,
  TextToSpeechRequestSchema,
  SpeechToTextRequestSchema,
  NavigationRequestSchema,
  VoiceCommandRequestSchema,
  AccessibilitySettingsSchema,
  
  // Common types
  APIResponseSchema,
  PaginationSchema,
  ErrorResponseSchema,
  HealthCheckSchema,
  FeatureFlagSchema,
  
  // User types
  UserProfileSchema,
  UpdateUserProfileSchema,
  UserPreferencesSchema,
  UserStatsSchema,
  UserSessionSchema,
  
  // AI types
  AIModelSchema,
  AIRequestSchema,
  AIResponseSchema,
  AIServiceHealthSchema,
  ModelPerformanceSchema,
  
  // Media types
  MediaFileSchema,
  MediaUploadRequestSchema,
  MediaUploadResponseSchema,
  MediaProcessingRequestSchema,
  MediaProcessingResponseSchema,
  MediaGallerySchema,
  
  // Navigation types
  LocationSchema,
  AddressSchema,
  PlaceSchema,
  RouteStepSchema,
  RouteSchema,
  NavigationSessionSchema,
  NavigationPreferencesSchema,
  
  // API types
  APIEndpointSchema,
  APIVersionSchema,
  APIDocumentationSchema
} from '@vision-platform/shared'

describe('Shared Types - Authentication', () => {
  describe('LoginRequestSchema', () => {
    it('should validate valid login request', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      const result = LoginRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }
      
      const result = LoginRequestSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email')
      }
    })

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      }
      
      const result = LoginRequestSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('String must contain at least 8 character(s)')
      }
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        email: 'test@example.com'
        // password missing
      }
      
      const result = LoginRequestSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Required')
      }
    })
  })

  describe('RegisterRequestSchema', () => {
    it('should validate valid registration request', () => {
      const validData = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user'
      }
      
      const result = RegisterRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('should set default role to user', () => {
      const dataWithoutRole = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        firstName: 'John',
        lastName: 'Doe'
      }
      
      const result = RegisterRequestSchema.safeParse(dataWithoutRole)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.role).toBe('user')
      }
    })

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'invalid-role'
      }
      
      const result = RegisterRequestSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid enum value')
      }
    })
  })

  describe('AuthResponseSchema', () => {
    it('should validate valid auth response', () => {
      const validData = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      }
      
      const result = AuthResponseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('JWTPayload', () => {
    it('should validate valid JWT payload', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        role: 'user',
        permissions: ['read:own', 'write:own'],
        iat: 1640995200,
        exp: 1641081600
      }
      
      const result = JWTPayload.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

describe('Shared Types - Translation', () => {
  describe('TranslationRequestSchema', () => {
    it('should validate valid translation request', () => {
      const validData = {
        sourceText: 'Hello, how are you?',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        context: 'conversation',
        quality: 'standard'
      }
      
      const result = TranslationRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should set default quality to standard', () => {
      const dataWithoutQuality = {
        sourceText: 'Hello, how are you?',
        sourceLanguage: 'en',
        targetLanguage: 'es'
      }
      
      const result = TranslationRequestSchema.safeParse(dataWithoutQuality)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.quality).toBe('standard')
      }
    })

    it('should reject text that is too long', () => {
      const longText = 'a'.repeat(5001)
      const invalidData = {
        sourceText: longText,
        sourceLanguage: 'en',
        targetLanguage: 'es'
      }
      
      const result = TranslationRequestSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('String must contain at most 5000 character(s)')
      }
    })
  })

  describe('TranslationResponseSchema', () => {
    it('should validate valid translation response', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        sourceText: 'Hello, how are you?',
        targetText: 'Hola, ¿cómo estás?',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        confidence: 0.95,
        processingTime: 1500,
        timestamp: '2024-01-01T00:00:00Z'
      }
      
      const result = TranslationResponseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate confidence score range', () => {
      const invalidData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        sourceText: 'Hello',
        targetText: 'Hola',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        confidence: 1.5, // Invalid: > 1.0
        processingTime: 1500,
        timestamp: '2024-01-01T00:00:00Z'
      }
      
      const result = TranslationResponseSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Number must be less than or equal to 1')
      }
    })
  })

  describe('BatchTranslationRequestSchema', () => {
    it('should validate valid batch translation request', () => {
      const validData = {
        translations: [
          {
            sourceText: 'Hello',
            sourceLanguage: 'en',
            targetLanguage: 'es'
          },
          {
            sourceText: 'Goodbye',
            sourceLanguage: 'en',
            targetLanguage: 'es'
          }
        ]
      }
      
      const result = BatchTranslationRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject too many translations', () => {
      const manyTranslations = Array.from({ length: 101 }, (_, i) => ({
        sourceText: `Text ${i}`,
        sourceLanguage: 'en',
        targetLanguage: 'es'
      }))
      
      const invalidData = {
        translations: manyTranslations
      }
      
      const result = BatchTranslationRequestSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Array must contain at most 100 element(s)')
      }
    })
  })
})

describe('Shared Types - Accessibility', () => {
  describe('SceneDescriptionRequestSchema', () => {
    it('should validate valid scene description request', () => {
      const validData = {
        image: 'base64-encoded-image-data',
        detail: 'comprehensive',
        includeObjects: true,
        includeText: true
      }
      
      const result = SceneDescriptionRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should set default detail to detailed', () => {
      const dataWithoutDetail = {
        image: 'base64-encoded-image-data',
        includeObjects: true,
        includeText: true
      }
      
      const result = SceneDescriptionRequestSchema.safeParse(dataWithoutDetail)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.detail).toBe('detailed')
      }
    })
  })

  describe('ObjectDetectionRequestSchema', () => {
    it('should validate valid object detection request', () => {
      const validData = {
        image: 'base64-encoded-image-data',
        confidence: 0.8
      }
      
      const result = ObjectDetectionRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should set default confidence to 0.7', () => {
      const dataWithoutConfidence = {
        image: 'base64-encoded-image-data'
      }
      
      const result = ObjectDetectionRequestSchema.safeParse(dataWithoutConfidence)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.confidence).toBe(0.7)
      }
    })

    it('should reject confidence values outside valid range', () => {
      const invalidData = {
        image: 'base64-encoded-image-data',
        confidence: 0.05 // Too low
      }
      
      const result = ObjectDetectionRequestSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Number must be greater than or equal to 0.1')
      }
    })
  })

  describe('NavigationRequestSchema', () => {
    it('should validate valid navigation request', () => {
      const validData = {
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        destination: {
          latitude: 40.7589,
          longitude: -73.9851
        },
        mode: 'walking',
        accessibility: true
      }
      
      const result = NavigationRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should set default mode to walking', () => {
      const dataWithoutMode = {
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        destination: {
          latitude: 40.7589,
          longitude: -73.9851
        }
      }
      
      const result = NavigationRequestSchema.safeParse(dataWithoutMode)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.mode).toBe('walking')
      }
    })

    it('should set default accessibility to true', () => {
      const dataWithoutAccessibility = {
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        destination: {
          latitude: 40.7589,
          longitude: -73.9851
        }
      }
      
      const result = NavigationRequestSchema.safeParse(dataWithoutAccessibility)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.accessibility).toBe(true)
      }
    })
  })
})

describe('Shared Types - Common', () => {
  describe('APIResponseSchema', () => {
    it('should validate valid API response', () => {
      const validData = {
        success: true,
        data: { message: 'Success' },
        message: 'Operation completed successfully',
        timestamp: '2024-01-01T00:00:00Z'
      }
      
      const result = APIResponseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('PaginationSchema', () => {
    it('should validate valid pagination data', () => {
      const validData = {
        page: 1,
        limit: 20,
        total: 100,
        pages: 5
      }
      
      const result = PaginationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid page numbers', () => {
      const invalidData = {
        page: 0, // Must be >= 1
        limit: 20,
        total: 100,
        pages: 5
      }
      
      const result = PaginationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Number must be greater than or equal to 1')
      }
    })
  })

  describe('ErrorResponseSchema', () => {
    it('should validate valid error response', () => {
      const validData = {
        error: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: { field: 'email', issue: 'Invalid format' },
        timestamp: '2024-01-01T00:00:00Z'
      }
      
      const result = ErrorResponseSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('HealthCheckSchema', () => {
    it('should validate valid health check response', () => {
      const validData = {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        uptime: 3600
      }
      
      const result = HealthCheckSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid status values', () => {
      const invalidData = {
        status: 'invalid-status',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0',
        uptime: 3600
      }
      
      const result = HealthCheckSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid enum value')
      }
    })
  })
})

describe('Shared Types - User', () => {
  describe('UserProfileSchema', () => {
    it('should validate valid user profile', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
      
      const result = UserProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('UserPreferencesSchema', () => {
    it('should validate valid user preferences', () => {
      const validData = {
        language: 'en',
        theme: 'dark',
        notifications: {
          email: true,
          push: false,
          sms: false
        },
        accessibility: {
          highContrast: true,
          largeText: false,
          screenReader: false
        }
      }
      
      const result = UserPreferencesSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

describe('Shared Types - AI', () => {
  describe('AIModelSchema', () => {
    it('should validate valid AI model', () => {
      const validData = {
        name: 'gpt-3.5-turbo',
        type: 'text-generation',
        provider: 'openai',
        language: 'multilingual',
        isActive: true,
        isDefault: true,
        performance: {
          accuracy: 0.95,
          speed: 100,
          latency: 200
        }
      }
      
      const result = AIModelSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('AIServiceHealthSchema', () => {
    it('should validate valid AI service health', () => {
      const validData = {
        status: 'healthy',
        models: [
          {
            name: 'gpt-3.5-turbo',
            type: 'text-generation',
            provider: 'openai',
            language: 'multilingual',
            isActive: true,
            isDefault: true
          }
        ],
        uptime: 86400,
        lastCheck: '2024-01-01T00:00:00Z'
      }
      
      const result = AIServiceHealthSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

describe('Shared Types - Media', () => {
  describe('MediaFileSchema', () => {
    it('should validate valid media file', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        filename: 'sample.jpg',
        originalName: 'sample.jpg',
        mimeType: 'image/jpeg',
        size: 1024000,
        url: 'https://example.com/files/sample.jpg',
        uploadedAt: '2024-01-01T00:00:00Z'
      }
      
      const result = MediaFileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('MediaUploadRequestSchema', () => {
    it('should validate valid media upload request', () => {
      const validData = {
        file: 'base64-encoded-file-data',
        type: 'image',
        purpose: 'translation'
      }
      
      const result = MediaUploadRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid file types', () => {
      const invalidData = {
        file: 'base64-encoded-file-data',
        type: 'invalid-type',
        purpose: 'translation'
      }
      
      const result = MediaUploadRequestSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid enum value')
      }
    })
  })
})

describe('Shared Types - Navigation', () => {
  describe('LocationSchema', () => {
    it('should validate valid location', () => {
      const validData = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001'
        }
      }
      
      const result = LocationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid latitude values', () => {
      const invalidData = {
        latitude: 91.0, // Must be <= 90
        longitude: -74.0060
      }
      
      const result = LocationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Number must be less than or equal to 90')
      }
    })

    it('should reject invalid longitude values', () => {
      const invalidData = {
        latitude: 40.7128,
        longitude: 181.0 // Must be <= 180
      }
      
      const result = LocationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Number must be less than or equal to 180')
      }
    })
  })

  describe('RouteSchema', () => {
    it('should validate valid route', () => {
      const validData = {
        steps: [
          {
            instruction: 'Turn right onto Main St',
            distance: 100,
            duration: 120,
            location: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          }
        ],
        totalDistance: 100,
        totalTime: 120
      }
      
      const result = RouteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

describe('Shared Types - API', () => {
  describe('APIEndpointSchema', () => {
    it('should validate valid API endpoint', () => {
      const validData = {
        path: '/api/translation/text',
        method: 'POST',
        description: 'Translate text between languages',
        parameters: ['sourceText', 'sourceLanguage', 'targetLanguage'],
        responses: ['200', '400', '401', '429']
      }
      
      const result = APIEndpointSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('APIVersionSchema', () => {
    it('should validate valid API version', () => {
      const validData = {
        version: '1.0.0',
        releaseDate: '2024-01-01',
        status: 'stable',
        breakingChanges: false,
        changelog: ['Added new translation features', 'Improved performance']
      }
      
      const result = APIVersionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

describe('Schema Integration Tests', () => {
  it('should handle nested schema validation correctly', () => {
    const complexData = {
      success: true,
      data: {
        translations: [
          {
            sourceText: 'Hello',
            sourceLanguage: 'en',
            targetLanguage: 'es',
            context: 'greeting'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1
        }
      },
      message: 'Translation completed successfully',
      timestamp: '2024-01-01T00:00:00Z'
    }
    
    const result = APIResponseSchema.safeParse(complexData)
    expect(result.success).toBe(true)
  })

  it('should handle optional fields correctly', () => {
    const minimalData = {
      sourceText: 'Hello',
      sourceLanguage: 'en',
      targetLanguage: 'es'
      // context and quality are optional
    }
    
    const result = TranslationRequestSchema.safeParse(minimalData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.context).toBeUndefined()
      expect(result.data.quality).toBe('standard') // default value
    }
  })

  it('should handle array validation correctly', () => {
    const arrayData = {
      translations: Array.from({ length: 50 }, (_, i) => ({
        sourceText: `Text ${i}`,
        sourceLanguage: 'en',
        targetLanguage: 'es'
      }))
    }
    
    const result = BatchTranslationRequestSchema.safeParse(arrayData)
    expect(result.success).toBe(true)
  })

  it('should handle enum validation correctly', () => {
    const validEnums = [
      { quality: 'fast' },
      { quality: 'standard' },
      { quality: 'high' }
    ]
    
    validEnums.forEach(enumData => {
      const result = TranslationRequestSchema.pick({ quality: true }).safeParse(enumData)
      expect(result.success).toBe(true)
    })
    
    const invalidEnum = { quality: 'invalid' }
    const result = TranslationRequestSchema.pick({ quality: true }).safeParse(invalidEnum)
    expect(result.success).toBe(false)
  })
})

describe('Schema Performance Tests', () => {
  it('should handle large objects efficiently', () => {
    const largeObject = {
      translations: Array.from({ length: 1000 }, (_, i) => ({
        sourceText: `Text ${i}`,
        sourceLanguage: 'en',
        targetLanguage: 'es',
        context: `context-${i}`,
        quality: 'standard'
      }))
    }
    
    const startTime = Date.now()
    const result = BatchTranslationRequestSchema.safeParse(largeObject)
    const endTime = Date.now()
    
    expect(result.success).toBe(false) // Should fail due to max 100 items
    expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
  })

  it('should handle deep nesting efficiently', () => {
    const deepNestedObject = {
      success: true,
      data: {
        user: {
          profile: {
            preferences: {
              accessibility: {
                voice: {
                  speed: 1.0,
                  pitch: 1.0,
                  volume: 0.8
                }
              }
            }
          }
        }
      }
    }
    
    const startTime = Date.now()
    const result = APIResponseSchema.safeParse(deepNestedObject)
    const endTime = Date.now()
    
    expect(result.success).toBe(true)
    expect(endTime - startTime).toBeLessThan(50) // Should complete within 50ms
  })
})
