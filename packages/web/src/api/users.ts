import { type ApiResponse, type User } from '@just-recordings/shared'
import config from '../config'
import { getToken } from '../services/supabase'

export const getMe = async (): Promise<ApiResponse<User>> => {
  try {
    const tokenResponse = await getToken()

    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(`${config.apiBaseUrl}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, errorCode: 'UNAUTHORIZED' }
      }
      return { success: false, errorCode: 'INTERNAL_ERROR' }
    }

    const json = await response.json()
    // API returns { success: true, data: { id, email, displayName, createdAt } }
    return { success: true, data: json.data }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}
