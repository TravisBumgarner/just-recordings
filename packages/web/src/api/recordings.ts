import { z } from 'zod';
import { API_BASE_URL } from './config';

const recordingSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  duration: z.number(),
  fileSize: z.number(),
  createdAt: z.string(),
  path: z.string(),
  thumbnailPath: z.string().optional(),
});

export type Recording = z.infer<typeof recordingSchema>;

const getRecordingsResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    recordings: z.array(recordingSchema),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

const getRecordingResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    recording: recordingSchema,
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

const deleteRecordingResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export type GetRecordingsResponse = z.infer<typeof getRecordingsResponseSchema>;
export type GetRecordingResponse = z.infer<typeof getRecordingResponseSchema>;
export type DeleteRecordingResponse = z.infer<typeof deleteRecordingResponseSchema>;

export const getRecordings = async (): Promise<GetRecordingsResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recordings`);

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fetch recordings with status ${response.status}`,
      };
    }

    const json = await response.json();
    return getRecordingsResponseSchema.parse({
      success: true,
      recordings: json.recordings,
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
};

export const getRecording = async (id: string): Promise<GetRecordingResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recordings/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          message: 'Recording not found',
        };
      }
      return {
        success: false,
        message: `Failed to fetch recording with status ${response.status}`,
      };
    }

    const json = await response.json();
    return getRecordingResponseSchema.parse({
      success: true,
      recording: json,
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
};

export const getVideoUrl = (id: string): string => {
  return `${API_BASE_URL}/recordings/${id}/video`;
};

export const getThumbnailUrl = (id: string): string => {
  return `${API_BASE_URL}/recordings/${id}/thumbnail`;
};

export const deleteRecording = async (id: string): Promise<DeleteRecordingResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/recordings/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to delete recording with status ${response.status}`,
      };
    }

    return deleteRecordingResponseSchema.parse({
      success: true,
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
};
