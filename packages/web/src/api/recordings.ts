import {
  type ApiResponse,
  type ErrorCode,
  type Recording,
} from '@just-recordings/shared'
import { getToken } from '@/services/supabase'
import config from '../config'

// Helper to convert HTTP error response to ApiFailure
async function parseErrorResponse(
  response: Response,
  notFoundCode: ErrorCode = 'NOT_FOUND'
): Promise<{ success: false; errorCode: ErrorCode }> {
  // Try to get errorCode from response body first
  const json = await response.json().catch(() => ({}))
  if (json.errorCode) {
    return { success: false, errorCode: json.errorCode }
  }

  // Fall back to HTTP status code mapping
  switch (response.status) {
    case 401:
      return { success: false, errorCode: 'UNAUTHORIZED' }
    case 403:
      return { success: false, errorCode: 'FORBIDDEN' }
    case 404:
      return { success: false, errorCode: notFoundCode }
    default:
      return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

export const getRecordings = async (): Promise<ApiResponse<Recording[]>> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return parseErrorResponse(response)
    }

    const json = await response.json()
    // API returns { success: true, data: { recordings: [...] } }
    return { success: true, data: json.data.recordings }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

export const getRecording = async (id: string): Promise<ApiResponse<Recording>> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return parseErrorResponse(response, 'RECORDING_NOT_FOUND')
    }

    const json = await response.json()
    // API returns { success: true, data: {...} }
    return { success: true, data: json.data }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

export const getVideoUrl = async (id: string): Promise<ApiResponse<string>> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}/video`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return parseErrorResponse(response, 'FILE_NOT_FOUND')
    }

    const blob = await response.blob()
    return { success: true, data: URL.createObjectURL(blob) }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

export const getThumbnailUrl = async (id: string): Promise<ApiResponse<string>> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}/thumbnail`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return parseErrorResponse(response, 'THUMBNAIL_NOT_FOUND')
    }

    const blob = await response.blob()
    return { success: true, data: URL.createObjectURL(blob) }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

export const deleteRecording = async (id: string): Promise<ApiResponse<{ deleted: true }>> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return parseErrorResponse(response, 'RECORDING_NOT_FOUND')
    }

    return { success: true, data: { deleted: true } }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

export const updateRecording = async (
  id: string,
  data: { name: string }
): Promise<ApiResponse<Recording>> => {
  // Stub: will be implemented in ralph-code phase
  return { success: false, errorCode: 'INTERNAL_ERROR' }
}
