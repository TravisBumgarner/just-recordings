import { z } from 'zod';

// Recording entity
export const recordingSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  mimeType: z.string(),
  duration: z.number(),
  fileSize: z.number(),
  createdAt: z.string(),
  path: z.string(),
  thumbnailPath: z.string().optional(),
});

export type Recording = z.infer<typeof recordingSchema>;

// GET /api/recordings - Server response
export const getRecordingsResponseSchema = z.object({
  recordings: z.array(recordingSchema),
});

export type GetRecordingsResponse = z.infer<typeof getRecordingsResponseSchema>;

// GET /api/recordings - Client wrapper (with error handling)
export const getRecordingsResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    recordings: z.array(recordingSchema),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export type GetRecordingsResult = z.infer<typeof getRecordingsResultSchema>;

// GET /api/recordings/:id - Server response
export const getRecordingResponseSchema = recordingSchema;

export type GetRecordingResponse = z.infer<typeof getRecordingResponseSchema>;

// GET /api/recordings/:id - Client wrapper
export const getRecordingResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    recording: recordingSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export type GetRecordingResult = z.infer<typeof getRecordingResultSchema>;

// DELETE /api/recordings/:id - Server response
export const deleteRecordingResponseSchema = z.object({
  success: z.literal(true),
});

export type DeleteRecordingResponse = z.infer<typeof deleteRecordingResponseSchema>;

// DELETE /api/recordings/:id - Client wrapper
export const deleteRecordingResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export type DeleteRecordingResult = z.infer<typeof deleteRecordingResultSchema>;
