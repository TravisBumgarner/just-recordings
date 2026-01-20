import { healthResultSchema, type HealthResult } from '@just-recordings/shared';
import { API_BASE_URL } from './config';

export const checkHealth = async (): Promise<HealthResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      return {
        success: false,
        message: `Health check failed with status ${response.status}`,
      };
    }

    const json = await response.json();
    return healthResultSchema.parse({
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
