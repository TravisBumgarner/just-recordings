import { healthResultSchema, type HealthResult } from '@just-recordings/shared';
import config from '../config';

export const checkHealth = async (): Promise<HealthResult> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/health`);

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
