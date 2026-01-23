import type { Recording } from '@just-recordings/shared'
import type { Response } from 'express'
import fs from 'node:fs/promises'
import { deleteRecording, getRecordingById } from '../../db/queries/recordings.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendForbidden, sendNotFound, sendSuccess } from '../shared/responses.js'
import { isValidUUID } from '../shared/validation.js'

export interface DeleteValidationContext {
  userId: string
  recordingId: string
  recording: Recording
}

export async function validate(
  req: AuthenticatedRequest,
  res: Response
): Promise<DeleteValidationContext | null> {
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

  return {
    userId: auth.userId,
    recordingId: id,
    recording: ownedRecording,
  }
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: DeleteValidationContext
): Promise<void> {
  const { recording, recordingId } = context

  // Delete video file
  try {
    await fs.unlink(recording.path)
  } catch {
    // File might already be deleted, continue
  }

  // Delete thumbnail file if it exists
  if (recording.thumbnailPath) {
    try {
      await fs.unlink(recording.thumbnailPath)
    } catch {
      // Thumbnail might already be deleted, continue
    }
  }

  // Remove from database
  await deleteRecording(recordingId)

  sendSuccess(res, { deleted: true })
}
