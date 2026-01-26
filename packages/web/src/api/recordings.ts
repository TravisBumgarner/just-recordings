import type {
  ApiResponse,
  ErrorCode,
  Recording,
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

export interface PaginatedRecordings {
  recordings: Recording[]
  total: number
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export const getRecordings = async (
  params: PaginationParams = {}
): Promise<ApiResponse<PaginatedRecordings>> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const searchParams = new URLSearchParams()
    if (params.limit !== undefined) {
      searchParams.set('limit', String(params.limit))
    }
    if (params.offset !== undefined) {
      searchParams.set('offset', String(params.offset))
    }

    const queryString = searchParams.toString()
    const url = `${config.apiBaseUrl}/recordings${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return parseErrorResponse(response)
    }

    const json = await response.json()
    // API returns { success: true, data: { recordings: [...], total: N } }
    return {
      success: true,
      data: {
        recordings: json.data.recordings,
        total: json.data.total,
      },
    }
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
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      return parseErrorResponse(response, 'RECORDING_NOT_FOUND')
    }

    const json = await response.json()
    return { success: true, data: json.data }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}
