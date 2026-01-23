import type { Recording } from '@just-recordings/shared'
import type { Response } from 'express'
import { getRecordingById } from '../../db/queries/recordings.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendForbidden, sendNotFound } from '../shared/responses.js'
import { isValidUUID } from '../shared/validation.js'

export interface ThumbnailValidationContext {
  userId: string
  recordingId: string
  recording: Recording
}

export async function validate(
  req: AuthenticatedRequest,
  res: Response
): Promise<ThumbnailValidationContext | null> {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  const { id } = req.params

  // Validate UUID format
  if (!isValidUUID(id)) {
    sendBadRequest(res, 'INVALID_UUID')
    return null
  }

  // Check if recording exists (query without userId filter)
  const existingRecording = await getRecordingById(id)
  if (!existingRecording) {
    sendNotFound(res, 'RECORDING_NOT_FOUND')
    return null
  }

  // Check if user owns the recording (query with userId filter)
  const ownedRecording = await getRecordingById(id, auth.userId)
  if (!ownedRecording) {
    sendForbidden(res)
    return null
  }

  // Check if thumbnailUrl exists on the recording
  if (!ownedRecording.thumbnailUrl) {
    sendNotFound(res, 'THUMBNAIL_NOT_FOUND')
    return null
  }

  return {
    userId: auth.userId,
    recordingId: id,
    recording: ownedRecording,
  }
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: ThumbnailValidationContext
): Promise<void> {
  // Redirect to Cloudinary thumbnail URL
  const thumbnailUrl = context.recording.thumbnailUrl as string
  res.redirect(302, thumbnailUrl)
}

export async function handler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const context = await validate(req, res)
  if (!context) return
  await processRequest(req, res, context)
}
