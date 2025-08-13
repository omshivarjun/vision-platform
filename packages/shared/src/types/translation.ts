import { z } from 'zod';

// Translation request types
export const TranslationRequestSchema = z.object({
  text: z.string().min(1),
  sourceLanguage: z.string().min(2).max(5),
  targetLanguage: z.string().min(2).max(5),
  quality: z.enum(['fast', 'balanced', 'high']).default('balanced'),
  context: z.string().optional(),
  preserveFormatting: z.boolean().default(true),
  glossary: z.array(z.object({
    term: z.string(),
    translation: z.string(),
  })).optional(),
});

export const TranslationResponseSchema = z.object({
  id: z.string(),
  originalText: z.string(),
  translatedText: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  confidence: z.number().min(0).max(1),
  processingTime: z.number(),
  quality: z.enum(['fast', 'balanced', 'high']),
  alternatives: z.array(z.string()).optional(),
  detectedLanguage: z.string().optional(),
  timestamp: z.string(),
});

// Batch translation types
export const BatchTranslationRequestSchema = z.object({
  texts: z.array(z.string()).min(1).max(100),
  sourceLanguage: z.string().min(2).max(5),
  targetLanguage: z.string().min(2).max(5),
  quality: z.enum(['fast', 'balanced', 'high']).default('balanced'),
});

export const BatchTranslationResponseSchema = z.object({
  translations: z.array(TranslationResponseSchema),
  totalProcessingTime: z.number(),
  successCount: z.number(),
  errorCount: z.number(),
  errors: z.array(z.object({
    index: z.number(),
    error: z.string(),
  })).optional(),
});

// Speech translation types
export const SpeechTranslationRequestSchema = z.object({
  audio: z.string(), // base64 encoded audio
  sourceLanguage: z.string().min(2).max(5),
  targetLanguage: z.string().min(2).max(5),
  outputFormat: z.enum(['text', 'audio', 'both']).default('text'),
  quality: z.enum(['fast', 'balanced', 'high']).default('balanced'),
});

export const SpeechTranslationResponseSchema = z.object({
  transcription: z.string(),
  translation: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  confidence: z.number().min(0).max(1),
  processingTime: z.number(),
  audioOutput: z.string().optional(), // base64 encoded audio
  timestamp: z.string(),
});

// Image translation types
export const ImageTranslationRequestSchema = z.object({
  image: z.string(), // base64 encoded image
  sourceLanguage: z.string().min(2).max(5),
  targetLanguage: z.string().min(2).max(5),
  ocrMode: z.enum(['fast', 'accurate']).default('accurate'),
  preserveLayout: z.boolean().default(true),
});

export const ImageTranslationResponseSchema = z.object({
  originalText: z.string(),
  translatedText: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  confidence: z.number().min(0).max(1),
  processingTime: z.number(),
  boundingBoxes: z.array(z.object({
    text: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    confidence: z.number(),
  })).optional(),
  timestamp: z.string(),
});

// Translation memory types
export const TranslationMemoryEntrySchema = z.object({
  id: z.string(),
  sourceText: z.string(),
  targetText: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  domain: z.string().optional(),
  usageCount: z.number().default(0),
  lastUsed: z.string(),
  createdAt: z.string(),
});

export const TranslationMemoryRequestSchema = z.object({
  sourceText: z.string(),
  sourceLanguage: z.string(),
  targetLanguage: z.string(),
  domain: z.string().optional(),
});

// Language detection types
export const LanguageDetectionRequestSchema = z.object({
  text: z.string().min(1),
  confidenceThreshold: z.number().min(0).max(1).default(0.8),
});

export const LanguageDetectionResponseSchema = z.object({
  detectedLanguage: z.string(),
  confidence: z.number().min(0).max(1),
  alternatives: z.array(z.object({
    language: z.string(),
    confidence: z.number(),
  })),
  processingTime: z.number(),
});

// Export types
export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;
export type TranslationResponse = z.infer<typeof TranslationResponseSchema>;
export type BatchTranslationRequest = z.infer<typeof BatchTranslationRequestSchema>;
export type BatchTranslationResponse = z.infer<typeof BatchTranslationResponseSchema>;
export type SpeechTranslationRequest = z.infer<typeof SpeechTranslationRequestSchema>;
export type SpeechTranslationResponse = z.infer<typeof SpeechTranslationResponseSchema>;
export type ImageTranslationRequest = z.infer<typeof ImageTranslationRequestSchema>;
export type ImageTranslationResponse = z.infer<typeof ImageTranslationResponseSchema>;
export type TranslationMemoryEntry = z.infer<typeof TranslationMemoryEntrySchema>;
export type TranslationMemoryRequest = z.infer<typeof TranslationMemoryRequestSchema>;
export type LanguageDetectionRequest = z.infer<typeof LanguageDetectionRequestSchema>;
export type LanguageDetectionResponse = z.infer<typeof LanguageDetectionResponseSchema>;

// Export schemas
export const TranslationSchemas = {
  TranslationRequest: TranslationRequestSchema,
  TranslationResponse: TranslationResponseSchema,
  BatchTranslationRequest: BatchTranslationRequestSchema,
  BatchTranslationResponse: BatchTranslationResponseSchema,
  SpeechTranslationRequest: SpeechTranslationRequestSchema,
  SpeechTranslationResponse: SpeechTranslationResponseSchema,
  ImageTranslationRequest: ImageTranslationRequestSchema,
  ImageTranslationResponse: ImageTranslationResponseSchema,
  TranslationMemoryEntry: TranslationMemoryEntrySchema,
  TranslationMemoryRequest: TranslationMemoryRequestSchema,
  LanguageDetectionRequest: LanguageDetectionRequestSchema,
  LanguageDetectionResponse: LanguageDetectionResponseSchema,
};
