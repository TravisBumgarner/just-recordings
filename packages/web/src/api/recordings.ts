import {
  getRecordingsResultSchema,
  getRecordingResultSchema,
  deleteRecordingResultSchema,
  type GetRecordingsResult,
  type GetRecordingResult,
  type DeleteRecordingResult,
} from '@just-recordings/shared'
import config from '../config'

export const getRecordings = async (): Promise<GetRecordingsResult> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/recordings`)

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
    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}`)

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

export const getVideoUrl = (id: string): string => {
  return `${config.apiBaseUrl}/recordings/${id}/video`
}

export const getThumbnailUrl = (id: string): string => {
  return `${config.apiBaseUrl}/recordings/${id}/thumbnail`
}

export const deleteRecording = async (id: string): Promise<DeleteRecordingResult> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/recordings/${id}`, {
      method: 'DELETE',
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
