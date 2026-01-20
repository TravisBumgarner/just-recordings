import { HealthResponse, ApiError } from '../types/api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${BASE_URL}/health`)

    if (!response.ok) {
      throw new ApiError('Health check failed', response.status)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error')
  }
}

export { ApiError }
