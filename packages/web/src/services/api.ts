import { HealthResponse, ApiError, RecordingMetadata, RecordingsListResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${BASE_URL}/health`);

    if (!response.ok) {
      throw new ApiError('Health check failed', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error');
  }
}

// Stub: Get all recordings from server
export async function getRecordings(): Promise<RecordingMetadata[]> {
  return [];
}

// Stub: Get single recording metadata from server
export async function getRecording(_id: string): Promise<RecordingMetadata | null> {
  return null;
}

// Get video URL for a recording
export function getVideoUrl(id: string): string {
  return `${BASE_URL}/recordings/${id}/video`;
}

// Stub: Delete a recording from server
export async function deleteRecording(_id: string): Promise<void> {
  return;
}

export { ApiError };
