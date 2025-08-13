// API Constants
export const API_CONSTANTS = {
  VERSION: 'v1',
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_BATCH_SIZE: 100,
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
} as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', native_name: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', native_name: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', native_name: 'Français', flag: '🇫🇷' },
  de: { name: 'German', native_name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italian', native_name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Portuguese', native_name: 'Português', flag: '🇵🇹' },
  ru: { name: 'Russian', native_name: 'Русский', flag: '🇷🇺' },
  ja: { name: 'Japanese', native_name: '日本語', flag: '🇯🇵' },
  ko: { name: 'Korean', native_name: '한국어', flag: '🇰🇷' },
  zh: { name: 'Chinese', native_name: '中文', flag: '🇨🇳' },
  ar: { name: 'Arabic', native_name: 'العربية', flag: '🇸🇦' },
  hi: { name: 'Hindi', native_name: 'हिन्दी', flag: '🇮🇳' },
  tr: { name: 'Turkish', native_name: 'Türkçe', flag: '🇹🇷' },
  nl: { name: 'Dutch', native_name: 'Nederlands', flag: '🇳🇱' },
  pl: { name: 'Polish', native_name: 'Polski', flag: '🇵🇱' },
  sv: { name: 'Swedish', native_name: 'Svenska', flag: '🇸🇪' },
} as const;

// AI Model Providers
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  GOOGLE: 'google',
  AZURE: 'azure',
  AWS: 'aws',
  LOCAL: 'local',
  HUGGINGFACE: 'huggingface',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  REAL_TIME_TRANSLATION: 'real_time_translation',
  OFFLINE_MODE: 'offline_mode',
  ADVANCED_OCR: 'advanced_ocr',
  VOICE_NAVIGATION: 'voice_navigation',
  OBJECT_DETECTION: 'object_detection',
  SCENE_DESCRIPTION: 'scene_description',
  MULTIMODAL_AI: 'multimodal_ai',
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

// File Types
export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  DOCUMENT: ['application/pdf', 'text/plain', 'application/msword'],
} as const;

// Navigation Modes
export const NAVIGATION_MODES = {
  WALKING: 'walking',
  TRANSIT: 'transit',
  DRIVING: 'driving',
  CYCLING: 'cycling',
} as const;

// Accessibility Levels
export const ACCESSIBILITY_LEVELS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  ENHANCED: 'enhanced',
} as const;

// Quality Levels
export const QUALITY_LEVELS = {
  FAST: 'fast',
  BALANCED: 'balanced',
  HIGH: 'high',
} as const;

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Environment
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile:',
  USER_PREFERENCES: 'user:preferences:',
  TRANSLATION_MEMORY: 'translation:memory:',
  LANGUAGE_DETECTION: 'language:detection:',
  AI_MODELS: 'ai:models',
  FEATURE_FLAGS: 'feature:flags',
} as const;

// Default Values
export const DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;
