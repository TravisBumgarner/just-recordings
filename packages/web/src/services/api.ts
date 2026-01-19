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

// Get all recordings from server
export async function getRecordings(): Promise<RecordingMetadata[]> {
  try {
    const response = await fetch(`${BASE_URL}/recordings`);

    if (!response.ok) {
      throw new ApiError('Failed to fetch recordings', response.status);
    }

    const data: RecordingsListResponse = await response.json();
    return data.recordings;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error');
  }
}

// Get single recording metadata from server
export async function getRecording(id: string): Promise<RecordingMetadata | null> {
  try {
    const response = await fetch(`${BASE_URL}/recordings/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new ApiError('Failed to fetch recording', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error');
  }
}

// Get video URL for a recording
export function getVideoUrl(id: string): string {
  return `${BASE_URL}/recordings/${id}/video`;
}

// Get thumbnail URL for a recording
export function getThumbnailUrl(id: string): string {
  return `${BASE_URL}/recordings/${id}/thumbnail`;
}

// Delete a recording from server
export async function deleteRecording(id: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/recordings/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new ApiError('Failed to delete recording', response.status);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error');
  }
}

export { ApiError };
