import { z } from 'zod';

// Media file types
export const MediaFileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(), // in bytes
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  metadata: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    duration: z.number().optional(), // in seconds
    bitrate: z.number().optional(),
    format: z.string().optional(),
  }),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Media upload types
export const MediaUploadRequestSchema = z.object({
  file: z.any(), // File object
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const MediaUploadResponseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  size: z.number(),
  mimeType: z.string(),
  processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
  createdAt: z.string(),
});

// Media processing types
export const MediaProcessingRequestSchema = z.object({
  mediaId: z.string(),
  operations: z.array(z.enum([
    'resize',
    'compress',
    'convert',
    'extract_audio',
    'extract_frames',
    'add_watermark',
    'ocr',
    'object_detection',
  ])),
  options: z.record(z.string(), z.unknown()).optional(),
});

export const MediaProcessingResponseSchema = z.object({
  id: z.string(),
  mediaId: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  results: z.array(z.object({
    operation: z.string(),
    status: z.enum(['success', 'failed']),
    result: z.unknown().optional(),
    error: z.string().optional(),
  })),
  processingTime: z.number(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

// Media gallery types
export const MediaGallerySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  media: z.array(MediaFileSchema),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Export types
export type MediaFile = z.infer<typeof MediaFileSchema>;
export type MediaUploadRequest = z.infer<typeof MediaUploadRequestSchema>;
export type MediaUploadResponse = z.infer<typeof MediaUploadResponseSchema>;
export type MediaProcessingRequest = z.infer<typeof MediaProcessingRequestSchema>;
export type MediaProcessingResponse = z.infer<typeof MediaProcessingResponseSchema>;
export type MediaGallery = z.infer<typeof MediaGallerySchema>;

// Export schemas
export const MediaSchemas = {
  MediaFile: MediaFileSchema,
  MediaUploadRequest: MediaUploadRequestSchema,
  MediaUploadResponse: MediaUploadResponseSchema,
  MediaProcessingRequest: MediaProcessingRequestSchema,
  MediaProcessingResponse: MediaProcessingResponseSchema,
  MediaGallery: MediaGallerySchema,
};
