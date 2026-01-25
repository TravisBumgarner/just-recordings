import { z } from 'zod'

// Share types enum
export const ShareType = {
  LINK: 'link',
  SINGLE_VIEW: 'single_view',
} as const

export type ShareType = (typeof ShareType)[keyof typeof ShareType]

export const shareTypeSchema = z.enum(['link', 'single_view'])

// Recording share entity
export const recordingShareSchema = z.object({
  id: z.string().uuid(),
  recordingId: z.string().uuid(),
  shareToken: z.string(),
  shareType: shareTypeSchema,
  viewCount: z.number(),
  maxViews: z.number().nullable(),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  shareUrl: z.string().optional(), // Computed field for convenience
  isActive: z.boolean().optional(), // Computed field
})

export type RecordingShare = z.infer<typeof recordingShareSchema>

// Public recording info (subset safe for public access)
export const publicRecordingInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  duration: z.number(),
  createdAt: z.string(),
})

export type PublicRecordingInfo = z.infer<typeof publicRecordingInfoSchema>

// POST /api/recordings/:id/shares - Request
export const createShareRequestSchema = z.object({
  shareType: shareTypeSchema,
})

export type CreateShareRequest = z.infer<typeof createShareRequestSchema>

// POST /api/recordings/:id/shares - Response
export const createShareResponseSchema = z.object({
  share: recordingShareSchema,
})

export type CreateShareResponse = z.infer<typeof createShareResponseSchema>

// GET /api/recordings/:id/shares - Response
export const getSharesResponseSchema = z.object({
  shares: z.array(recordingShareSchema),
})

export type GetSharesResponse = z.infer<typeof getSharesResponseSchema>

// GET /api/share/:token - Response (public)
export const getPublicRecordingResponseSchema = z.object({
  recording: publicRecordingInfoSchema,
})

export type GetPublicRecordingResponse = z.infer<typeof getPublicRecordingResponseSchema>
