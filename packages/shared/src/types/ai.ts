import { z } from 'zod';

// AI model types
export const AIModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['translation', 'ocr', 'stt', 'tts', 'object_detection', 'scene_description']),
  provider: z.enum(['openai', 'google', 'azure', 'aws', 'local', 'huggingface']),
  version: z.string(),
  language: z.string().optional(),
  isActive: z.boolean().default(true),
  performance: z.object({
    accuracy: z.number().min(0).max(1),
    speed: z.number().min(0).max(1),
    cost: z.number().min(0),
  }),
  capabilities: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// AI request types
export const AIRequestSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  modelId: z.string(),
  type: z.enum(['translation', 'ocr', 'stt', 'tts', 'object_detection', 'scene_description']),
  input: z.record(z.string(), z.unknown()),
  options: z.record(z.string(), z.unknown()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  createdAt: z.string(),
});

// AI response types
export const AIResponseSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  modelId: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  result: z.unknown().optional(),
  error: z.string().optional(),
  metadata: z.object({
    processingTime: z.number(),
    modelVersion: z.string(),
    confidence: z.number().min(0).max(1).optional(),
    tokensUsed: z.number().optional(),
    cost: z.number().optional(),
  }),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

// AI service health types
export const AIServiceHealthSchema = z.object({
  service: z.string(),
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  models: z.array(z.object({
    id: z.string(),
    status: z.enum(['available', 'degraded', 'unavailable']),
    responseTime: z.number(),
    lastCheck: z.string(),
  })),
  resources: z.object({
    cpu: z.number().min(0).max(100),
    memory: z.number().min(0).max(100),
    gpu: z.number().min(0).max(100).optional(),
    queueLength: z.number(),
  }),
  lastCheck: z.string(),
});

// AI model performance types
export const ModelPerformanceSchema = z.object({
  modelId: z.string(),
  metrics: z.object({
    totalRequests: z.number(),
    successfulRequests: z.number(),
    failedRequests: z.number(),
    averageResponseTime: z.number(),
    averageAccuracy: z.number().min(0).max(1),
    totalCost: z.number(),
  }),
  timeRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  createdAt: z.string(),
});

// Export types
export type AIModel = z.infer<typeof AIModelSchema>;
export type AIRequest = z.infer<typeof AIRequestSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;
export type AIServiceHealth = z.infer<typeof AIServiceHealthSchema>;
export type ModelPerformance = z.infer<typeof ModelPerformanceSchema>;

// Export schemas
export const AISchemas = {
  AIModel: AIModelSchema,
  AIRequest: AIRequestSchema,
  AIResponse: AIResponseSchema,
  AIServiceHealth: AIServiceHealthSchema,
  ModelPerformance: ModelPerformanceSchema,
};
