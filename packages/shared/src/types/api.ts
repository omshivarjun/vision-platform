import { z } from 'zod';

// API endpoint types
export const APIEndpointSchema = z.object({
  path: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  description: z.string(),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    description: z.string(),
  })).optional(),
  requestBody: z.unknown().optional(),
  responseBody: z.unknown().optional(),
  authentication: z.boolean().default(false),
  rateLimit: z.object({
    requests: z.number(),
    window: z.number(), // in seconds
  }).optional(),
});

// API version types
export const APIVersionSchema = z.object({
  version: z.string(),
  status: z.enum(['deprecated', 'stable', 'beta', 'alpha']),
  releaseDate: z.string(),
  endOfLife: z.string().optional(),
  changes: z.array(z.object({
    type: z.enum(['added', 'changed', 'deprecated', 'removed', 'fixed']),
    description: z.string(),
    breaking: z.boolean().default(false),
  })),
});

// API documentation types
export const APIDocumentationSchema = z.object({
  title: z.string(),
  version: z.string(),
  description: z.string(),
  baseUrl: z.string().url(),
  endpoints: z.array(APIEndpointSchema),
  versions: z.array(APIVersionSchema),
  authentication: z.object({
    type: z.enum(['bearer', 'api_key', 'oauth2']),
    description: z.string(),
    endpoints: z.array(z.string()),
  }),
  rateLimiting: z.object({
    description: z.string(),
    limits: z.record(z.string(), z.object({
      requests: z.number(),
      window: z.number(),
    })),
  }),
  errorCodes: z.array(z.object({
    code: z.string(),
    message: z.string(),
    description: z.string(),
    httpStatus: z.number(),
  })),
});

// Export types
export type APIEndpoint = z.infer<typeof APIEndpointSchema>;
export type APIVersion = z.infer<typeof APIVersionSchema>;
export type APIDocumentation = z.infer<typeof APIDocumentationSchema>;

// Export schemas
export const APISchemas = {
  APIEndpoint: APIEndpointSchema,
  APIVersion: APIVersionSchema,
  APIDocumentation: APIDocumentationSchema,
};
