import { z } from 'zod';
import { API_BASE_URL } from './config';

const healthResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    status: z.enum(['ok', 'error']),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      return {
        success: false,
        message: `Health check failed with status ${response.status}`,
      };
    }

    const json = await response.json();
    return healthResponseSchema.parse({
      success: true,
      status: json.status,
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
};
