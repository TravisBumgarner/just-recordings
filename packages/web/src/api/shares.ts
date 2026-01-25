import type {
  ApiResponse,
  ErrorCode,
  PublicRecordingInfo,
  RecordingShare,
  ShareType,
} from '@just-recordings/shared'
import { getToken } from '@/services/supabase'
import config from '../config'

// Helper to convert HTTP error response to ApiFailure
async function parseErrorResponse(
  response: Response,
  notFoundCode: ErrorCode = 'SHARE_NOT_FOUND'
): Promise<{ success: false; errorCode: ErrorCode }> {
  const json = await response.json().catch(() => ({}))
  if (json.errorCode) {
    return { success: false, errorCode: json.errorCode }
  }

  switch (response.status) {
    case 401:
      return { success: false, errorCode: 'UNAUTHORIZED' }
    case 403:
      return { success: false, errorCode: 'FORBIDDEN' }
    case 404:
      return { success: false, errorCode: notFoundCode }
    case 410:
      // Gone - used for expired/revoked shares
      return { success: false, errorCode: json.errorCode || 'SHARE_NOT_FOUND' }
    default:
      return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

/**
 * Create a new share link for a recording
 */
export const createShare = async (
  recordingId: string,
  shareType: ShareType
): Promise<ApiResponse<RecordingShare>> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${recordingId}/shares`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenResponse.token}`,
      },
      body: JSON.stringify({ shareType }),
    })

    if (!response.ok) {
      return parseErrorResponse(response, 'RECORDING_NOT_FOUND')
    }

    const json = await response.json()
    return { success: true, data: json.data.share }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

/**
 * Get all shares for a recording
 */
export const getShares = async (recordingId: string): Promise<ApiResponse<RecordingShare[]>> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${recordingId}/shares`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return parseErrorResponse(response, 'RECORDING_NOT_FOUND')
    }

    const json = await response.json()
    return { success: true, data: json.data.shares }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

/**
 * Revoke a share link
 */
export const revokeShare = async (
  recordingId: string,
  shareId: string
): Promise<ApiResponse<{ revoked: true }>> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return { success: false, errorCode: 'UNAUTHORIZED' }
    }

    const response = await fetch(
      `${config.apiBaseUrl}/recordings/${recordingId}/shares/${shareId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tokenResponse.token}`,
        },
      }
    )

    if (!response.ok) {
      return parseErrorResponse(response)
    }

    return { success: true, data: { revoked: true } }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

/**
 * Get public recording info by share token (no auth required)
 */
export const getPublicRecording = async (
  token: string
): Promise<ApiResponse<PublicRecordingInfo>> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/share/${token}`)

    if (!response.ok) {
      return parseErrorResponse(response)
    }

    const json = await response.json()
    return { success: true, data: json.data.recording }
  } catch {
    return { success: false, errorCode: 'INTERNAL_ERROR' }
  }
}

/**
 * Get public video URL by share token (no auth required)
 * Returns the URL to stream the video
 */
export const getPublicVideoUrl = (token: string): string => {
  return `${config.apiBaseUrl}/share/${token}/video`
}

/**
 * Get public thumbnail URL by share token (no auth required)
 */
export const getPublicThumbnailUrl = (token: string): string => {
  return `${config.apiBaseUrl}/share/${token}/thumbnail`
}
