import {
  type DeleteRecordingResult,
  deleteRecordingResultSchema,
  type GetRecordingResult,
  type GetRecordingsResult,
  getRecordingResultSchema,
  getRecordingsResultSchema,
} from '@just-recordings/shared'
import { getToken } from '@/services/supabase'
import config from '../config'

export const getRecordings = async (): Promise<GetRecordingsResult> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return {
        success: false,
        message: 'Unauthorized',
      }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fetch recordings with status ${response.status}`,
      }
    }

    const json = await response.json()
    return getRecordingsResultSchema.parse({
      success: true,
      recordings: json.recordings,
    })
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    }
  }
}

export const getRecording = async (id: string): Promise<GetRecordingResult> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return {
        success: false,
        message: 'Unauthorized',
      }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          message: 'Recording not found',
        }
      }
      return {
        success: false,
        message: `Failed to fetch recording with status ${response.status}`,
      }
    }

    const json = await response.json()
    return getRecordingResultSchema.parse({
      success: true,
      recording: json,
    })
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    }
  }
}

export const getVideoUrl = async (id: string): Promise<string | null> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return null
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}/video`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

export const getThumbnailUrl = async (id: string): Promise<string | null> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return null
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}/thumbnail`, {
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch {
    return null
  }
}

export const deleteRecording = async (id: string): Promise<DeleteRecordingResult> => {
  try {
    const tokenResponse = await getToken()
    if (!tokenResponse.success || !tokenResponse.token) {
      return {
        success: false,
        message: 'Unauthorized',
      }
    }

    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenResponse.token}`,
      },
    })

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to delete recording with status ${response.status}`,
      }
    }

    return deleteRecordingResultSchema.parse({
      success: true,
    })
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    }
  }
}
