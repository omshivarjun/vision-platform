import { z } from 'zod';

// Common response wrapper
export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
  error: z.string().optional(),
  timestamp: z.string(),
  requestId: z.string().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  total: z.number(),
  totalPages: z.number(),
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    timestamp: z.string(),
    requestId: z.string().optional(),
  }),
});

// Health check types
export const HealthCheckSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(),
  version: z.string(),
  uptime: z.number(),
  services: z.record(z.string(), z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    responseTime: z.number().optional(),
    lastCheck: z.string(),
  })),
});

// Feature flags
export const FeatureFlagSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  description: z.string(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  environments: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Export types
export type APIResponse<T = unknown> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
  requestId?: string;
};

export type Pagination = z.infer<typeof PaginationSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

// Export schemas
export const CommonSchemas = {
  APIResponse: APIResponseSchema,
  Pagination: PaginationSchema,
  ErrorResponse: ErrorResponseSchema,
  HealthCheck: HealthCheckSchema,
  FeatureFlag: FeatureFlagSchema,
};
