import { z } from 'zod'

// User-related types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  preferences: z.object({
    language: z.string(),
    accessibilityLevel: z.enum(['Basic', 'Standard', 'Enhanced']),
    notifications: z.boolean(),
    glossary: z.array(z.object({
      term: z.string(),
      definition: z.string(),
      language: z.string(),
    })),
    translationHistory: z.array(z.object({
      id: z.string(),
      from: z.string(),
      to: z.string(),
      fromLang: z.string(),
      toLang: z.string(),
      date: z.string(),
    })),
  }),
  profile: z.object({
    avatar: z.string().optional(),
    bio: z.string().optional(),
    location: z.string().optional(),
  }),
})

export type User = z.infer<typeof UserSchema>

// Translation types
export const TranslationRequestSchema = z.object({
  text: z.string(),
  source_lang: z.string(),
  target_lang: z.string(),
  quality: z.enum(['Fast', 'Balanced', 'High Quality']).optional(),
})

export const TranslationResponseSchema = z.object({
  translated_text: z.string(),
  confidence: z.number(),
  source_lang: z.string(),
  target_lang: z.string(),
  processing_time: z.number(),
})

export type TranslationRequest = z.infer<typeof TranslationRequestSchema>
export type TranslationResponse = z.infer<typeof TranslationResponseSchema>

// OCR types
export const OCRRequestSchema = z.object({
  image: z.string(), // base64 encoded image
  language: z.string().optional(),
})

export const OCRResponseSchema = z.object({
  text: z.string(),
  confidence: z.number(),
  language: z.string(),
  processing_time: z.number(),
})

export type OCRRequest = z.infer<typeof OCRRequestSchema>
export type OCRResponse = z.infer<typeof OCRResponseSchema>

// Scene analysis types
export const SceneAnalysisRequestSchema = z.object({
  image: z.string(), // base64 encoded image
})

export const SceneAnalysisResponseSchema = z.object({
  description: z.string(),
  objects: z.array(z.string()),
  confidence: z.number(),
  processing_time: z.number(),
})

export type SceneAnalysisRequest = z.infer<typeof SceneAnalysisRequestSchema>
export type SceneAnalysisResponse = z.infer<typeof SceneAnalysisResponseSchema>

// Speech-to-text types
export const SpeechToTextRequestSchema = z.object({
  audio: z.string(), // base64 encoded audio
  language: z.string().optional(),
})

export const SpeechToTextResponseSchema = z.object({
  text: z.string(),
  confidence: z.number(),
  language: z.string(),
  processing_time: z.number(),
})

export type SpeechToTextRequest = z.infer<typeof SpeechToTextRequestSchema>
export type SpeechToTextResponse = z.infer<typeof SpeechToTextResponseSchema>

// Text-to-speech types
export const TextToSpeechRequestSchema = z.object({
  text: z.string(),
  language: z.string(),
  voice: z.string().optional(),
  speed: z.number().optional(),
})

export const TextToSpeechResponseSchema = z.object({
  audio: z.string(), // base64 encoded audio
  format: z.string(),
  processing_time: z.number(),
})

export type TextToSpeechRequest = z.infer<typeof TextToSpeechRequestSchema>
export type TextToSpeechResponse = z.infer<typeof TextToSpeechResponseSchema>

// API response wrapper
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
  error: z.string().optional(),
})

export type APIResponse<T = unknown> = {
  success: boolean
  data: T
  message?: string
  error?: string
}

// Health check types
export const HealthCheckSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  version: z.string(),
  services: z.record(z.string(), z.string()),
})

export type HealthCheck = z.infer<typeof HealthCheckSchema>

// Language types
export const LanguageSchema = z.object({
  code: z.string(),
  name: z.string(),
  native_name: z.string(),
  supported_features: z.array(z.enum(['translation', 'ocr', 'stt', 'tts'])),
})

export type Language = z.infer<typeof LanguageSchema>

// Export all schemas
export const Schemas = {
  User: UserSchema,
  TranslationRequest: TranslationRequestSchema,
  TranslationResponse: TranslationResponseSchema,
  OCRRequest: OCRRequestSchema,
  OCRResponse: OCRResponseSchema,
  SceneAnalysisRequest: SceneAnalysisRequestSchema,
  SceneAnalysisResponse: SceneAnalysisResponseSchema,
  SpeechToTextRequest: SpeechToTextRequestSchema,
  SpeechToTextResponse: SpeechToTextResponseSchema,
  TextToSpeechRequest: TextToSpeechRequestSchema,
  TextToSpeechResponse: TextToSpeechResponseSchema,
  APIResponse: APIResponseSchema,
  HealthCheck: HealthCheckSchema,
  Language: LanguageSchema,
}
