import { HealthResponse, ApiError } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Stub: Returns wrong value so tests fail (TDD red phase)
export async function checkHealth(): Promise<HealthResponse> {
  return { status: 'error' };
}

export { ApiError };
