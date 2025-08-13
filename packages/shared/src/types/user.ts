import { z } from 'zod';

// User profile types
export const UserProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['user', 'admin', 'moderator']).default('user'),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().min(2).max(5).default('en'),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLoginAt: z.string().optional(),
});

export const UpdateUserProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().min(2).max(5).optional(),
});

// User preferences types
export const UserPreferencesSchema = z.object({
  userId: z.string(),
  translation: z.object({
    defaultSourceLanguage: z.string().min(2).max(5).default('en'),
    defaultTargetLanguage: z.string().min(2).max(5).default('es'),
    quality: z.enum(['fast', 'balanced', 'high']).default('balanced'),
    autoDetectLanguage: z.boolean().default(true),
    saveHistory: z.boolean().default(true),
    glossary: z.array(z.object({
      term: z.string(),
      translation: z.string(),
      language: z.string(),
      domain: z.string().optional(),
    })).default([]),
  }),
  accessibility: z.object({
    voiceSettings: z.object({
      speed: z.number().min(0.5).max(2.0).default(1.0),
      pitch: z.number().min(0.5).max(2.0).default(1.0),
      volume: z.number().min(0.0).max(1.0).default(1.0),
      voice: z.string().default('default'),
    }),
    visualSettings: z.object({
      highContrast: z.boolean().default(false),
      largeText: z.boolean().default(false),
      colorBlindMode: z.boolean().default(false),
      reduceMotion: z.boolean().default(false),
    }),
    audioSettings: z.object({
      audioDescriptions: z.boolean().default(true),
      captions: z.boolean().default(true),
      soundEffects: z.boolean().default(true),
      hapticFeedback: z.boolean().default(true),
    }),
    navigationSettings: z.object({
      voiceGuidance: z.boolean().default(true),
      obstacleWarnings: z.boolean().default(true),
      stepByStep: z.boolean().default(true),
      autoReroute: z.boolean().default(true),
    }),
  }),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
    translationComplete: z.boolean().default(true),
    accessibilityAlerts: z.boolean().default(true),
    navigationUpdates: z.boolean().default(true),
    systemUpdates: z.boolean().default(false),
  }),
  privacy: z.object({
    dataRetention: z.number().min(1).max(3650).default(365), // days
    analytics: z.boolean().default(false),
    crashReports: z.boolean().default(true),
    cloudProcessing: z.boolean().default(true),
    shareUsageData: z.boolean().default(false),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// User statistics types
export const UserStatsSchema = z.object({
  userId: z.string(),
  translations: z.object({
    total: z.number().default(0),
    today: z.number().default(0),
    thisWeek: z.number().default(0),
    thisMonth: z.number().default(0),
    languages: z.record(z.string(), z.number()).default({}),
  }),
  accessibility: z.object({
    sceneDescriptions: z.number().default(0),
    objectDetections: z.number().default(0),
    textToSpeech: z.number().default(0),
    speechToText: z.number().default(0),
    navigationSessions: z.number().default(0),
  }),
  usage: z.object({
    totalTime: z.number().default(0), // in seconds
    lastActivity: z.string().optional(),
    favoriteFeatures: z.array(z.string()).default([]),
    deviceTypes: z.record(z.string(), z.number()).default({}),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// User session types
export const UserSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  deviceId: z.string(),
  deviceType: z.enum(['web', 'mobile', 'tablet', 'desktop']),
  userAgent: z.string(),
  ipAddress: z.string().optional(),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  isActive: z.boolean().default(true),
  lastActivity: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
});

// Export types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;

// Export schemas
export const UserSchemas = {
  UserProfile: UserProfileSchema,
  UpdateUserProfile: UpdateUserProfileSchema,
  UserPreferences: UserPreferencesSchema,
  UserStats: UserStatsSchema,
  UserSession: UserSessionSchema,
};
