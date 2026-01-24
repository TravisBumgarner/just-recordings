import type { ApiResponse } from '@just-recordings/shared'
import config from '../config'

export interface HealthStatus {
  status: string
}

export const checkHealth = async (): Promise<ApiResponse<HealthStatus>> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/health`)

    if (!response.ok) {
      return { success: false, errorCode: 'INTERNAL_ERROR' }
    }

    const json = await response.json()
    return { success: true, data: { status: json.status } }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}
