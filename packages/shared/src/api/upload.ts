import { z } from 'zod'

// POST /api/dev/upload/start
export const startUploadResponseSchema = z.object({
  uploadId: z.string(),
})

export type StartUploadResponse = z.infer<typeof startUploadResponseSchema>

// POST /api/dev/upload/:id/chunk
export const uploadChunkRequestSchema = z.object({
  index: z.coerce.number().int().min(0),
})

export type UploadChunkRequest = z.infer<typeof uploadChunkRequestSchema>

export const uploadChunkResponseSchema = z.object({
  received: z.literal(true),
  index: z.number(),
})

export type UploadChunkResponse = z.infer<typeof uploadChunkResponseSchema>

// POST /api/dev/upload/:id/finalize
export const finalizeUploadRequestSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  totalChunks: z.number().int().min(1),
  duration: z.number().optional(),
})

export type FinalizeUploadRequest = z.infer<typeof finalizeUploadRequestSchema>

export const finalizeUploadResponseSchema = z.object({
  success: z.literal(true),
  fileId: z.string(),
  path: z.string(),
  size: z.number(),
})

export type FinalizeUploadResponse = z.infer<typeof finalizeUploadResponseSchema>
