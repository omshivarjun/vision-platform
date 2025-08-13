import { z } from 'zod';

// Scene description types
export const SceneDescriptionRequestSchema = z.object({
  image: z.string(), // base64 encoded image
  detailLevel: z.enum(['basic', 'detailed', 'comprehensive']).default('detailed'),
  includeObjects: z.boolean().default(true),
  includeText: z.boolean().default(true),
  includeSpatialInfo: z.boolean().default(true),
});

export const SceneDescriptionResponseSchema = z.object({
  id: z.string(),
  description: z.string(),
  objects: z.array(z.object({
    name: z.string(),
    confidence: z.number().min(0).max(1),
    boundingBox: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    attributes: z.array(z.string()).optional(),
  })),
  textElements: z.array(z.object({
    text: z.string(),
    confidence: z.number().min(0).max(1),
    boundingBox: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
  })),
  spatialInfo: z.object({
    layout: z.string(),
    depth: z.string().optional(),
    lighting: z.string().optional(),
  }).optional(),
  confidence: z.number().min(0).max(1),
  processingTime: z.number(),
  timestamp: z.string(),
});

// Object detection types
export const ObjectDetectionRequestSchema = z.object({
  image: z.string(), // base64 encoded image
  confidenceThreshold: z.number().min(0).max(1).default(0.7),
  maxObjects: z.number().min(1).max(100).default(20),
  includeDistance: z.boolean().default(false),
});

export const ObjectDetectionResponseSchema = z.object({
  id: z.string(),
  objects: z.array(z.object({
    name: z.string(),
    confidence: z.number().min(0).max(1),
    boundingBox: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    }),
    distance: z.number().optional(), // in meters
    category: z.string().optional(),
    attributes: z.array(z.string()).optional(),
  })),
  processingTime: z.number(),
  timestamp: z.string(),
});

// Text-to-speech types
export const TextToSpeechRequestSchema = z.object({
  text: z.string().min(1),
  language: z.string().min(2).max(5),
  voice: z.string().optional(),
  speed: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(0.5).max(2.0).default(1.0),
  volume: z.number().min(0.0).max(1.0).default(1.0),
  outputFormat: z.enum(['mp3', 'wav', 'ogg']).default('mp3'),
});

export const TextToSpeechResponseSchema = z.object({
  id: z.string(),
  audioUrl: z.string(),
  duration: z.number(), // in seconds
  format: z.string(),
  processingTime: z.number(),
  timestamp: z.string(),
});

// Speech-to-text types
export const SpeechToTextRequestSchema = z.object({
  audio: z.string(), // base64 encoded audio
  language: z.string().min(2).max(5).optional(),
  model: z.enum(['fast', 'accurate']).default('accurate'),
  timestamping: z.boolean().default(false),
  punctuation: z.boolean().default(true),
  profanityFilter: z.boolean().default(false),
});

export const SpeechToTextResponseSchema = z.object({
  id: z.string(),
  text: z.string(),
  confidence: z.number().min(0).max(1),
  language: z.string(),
  processingTime: z.number(),
  timestamp: z.string(),
  segments: z.array(z.object({
    text: z.string(),
    start: z.number(),
    end: z.number(),
    confidence: z.number(),
  })).optional(),
});

// Navigation assistance types
export const NavigationRequestSchema = z.object({
  destination: z.string(),
  currentLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
  }),
  mode: z.enum(['walking', 'transit', 'driving']).default('walking'),
  accessibility: z.object({
    wheelchairAccessible: z.boolean().default(false),
    avoidStairs: z.boolean().default(false),
    avoidCrossings: z.boolean().default(false),
  }).optional(),
});

export const NavigationResponseSchema = z.object({
  id: z.string(),
  route: z.object({
    distance: z.number(), // in meters
    duration: z.number(), // in seconds
    steps: z.array(z.object({
      instruction: z.string(),
      distance: z.number(),
      duration: z.number(),
      maneuver: z.string(),
      warnings: z.array(z.string()).optional(),
    })),
  }),
  accessibility: z.object({
    wheelchairAccessible: z.boolean(),
    hasElevators: z.boolean(),
    hasRamps: z.boolean(),
    hasAudioSignals: z.boolean(),
  }),
  processingTime: z.number(),
  timestamp: z.string(),
});

// Voice control types
export const VoiceCommandRequestSchema = z.object({
  audio: z.string(), // base64 encoded audio
  context: z.string().optional(),
  expectedCommand: z.enum([
    'translate',
    'describe_scene',
    'navigate',
    'read_text',
    'adjust_settings',
    'help',
  ]).optional(),
});

export const VoiceCommandResponseSchema = z.object({
  id: z.string(),
  command: z.string(),
  confidence: z.number().min(0).max(1),
  parameters: z.record(z.string(), z.unknown()),
  action: z.string(),
  processingTime: z.number(),
  timestamp: z.string(),
});

// Accessibility settings types
export const AccessibilitySettingsSchema = z.object({
  userId: z.string(),
  voiceSettings: z.object({
    speed: z.number().min(0.5).max(2.0),
    pitch: z.number().min(0.5).max(2.0),
    volume: z.number().min(0.0).max(1.0),
    voice: z.string(),
    language: z.string(),
  }),
  visualSettings: z.object({
    highContrast: z.boolean(),
    largeText: z.boolean(),
    colorBlindMode: z.boolean(),
    reduceMotion: z.boolean(),
  }),
  audioSettings: z.object({
    audioDescriptions: z.boolean(),
    captions: z.boolean(),
    soundEffects: z.boolean(),
    hapticFeedback: z.boolean(),
  }),
  navigationSettings: z.object({
    voiceGuidance: z.boolean(),
    obstacleWarnings: z.boolean(),
    stepByStep: z.boolean(),
    autoReroute: z.boolean(),
  }),
  privacySettings: z.object({
    cloudProcessing: z.boolean(),
    dataRetention: z.number(), // days
    analytics: z.boolean(),
    crashReports: z.boolean(),
  }),
});

// Export types
export type SceneDescriptionRequest = z.infer<typeof SceneDescriptionRequestSchema>;
export type SceneDescriptionResponse = z.infer<typeof SceneDescriptionResponseSchema>;
export type ObjectDetectionRequest = z.infer<typeof ObjectDetectionRequestSchema>;
export type ObjectDetectionResponse = z.infer<typeof ObjectDetectionResponseSchema>;
export type TextToSpeechRequest = z.infer<typeof TextToSpeechRequestSchema>;
export type TextToSpeechResponse = z.infer<typeof TextToSpeechResponseSchema>;
export type SpeechToTextRequest = z.infer<typeof SpeechToTextRequestSchema>;
export type SpeechToTextResponse = z.infer<typeof SpeechToTextResponseSchema>;
export type NavigationRequest = z.infer<typeof NavigationRequestSchema>;
export type NavigationResponse = z.infer<typeof NavigationResponseSchema>;
export type VoiceCommandRequest = z.infer<typeof VoiceCommandRequestSchema>;
export type VoiceCommandResponse = z.infer<typeof VoiceCommandResponseSchema>;
export type AccessibilitySettings = z.infer<typeof AccessibilitySettingsSchema>;

// Export schemas
export const AccessibilitySchemas = {
  SceneDescriptionRequest: SceneDescriptionRequestSchema,
  SceneDescriptionResponse: SceneDescriptionResponseSchema,
  ObjectDetectionRequest: ObjectDetectionRequestSchema,
  ObjectDetectionResponse: ObjectDetectionResponseSchema,
  TextToSpeechRequest: TextToSpeechRequestSchema,
  TextToSpeechResponse: TextToSpeechResponseSchema,
  SpeechToTextRequest: SpeechToTextRequestSchema,
  SpeechToTextResponse: SpeechToTextResponseSchema,
  NavigationRequest: NavigationRequestSchema,
  NavigationResponse: NavigationResponseSchema,
  VoiceCommandRequest: VoiceCommandRequestSchema,
  VoiceCommandResponse: VoiceCommandResponseSchema,
  AccessibilitySettings: AccessibilitySettingsSchema,
};
