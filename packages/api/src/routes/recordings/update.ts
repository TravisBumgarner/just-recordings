import type { Recording } from '@just-recordings/shared'
import type { Response } from 'express'
import { getRecordingById, updateRecordingName } from '../../db/queries/recordings.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendForbidden, sendNotFound, sendSuccess } from '../shared/responses.js'
import { isValidUUID } from '../shared/validation.js'

export interface UpdateValidationContext {
  userId: string
  recordingId: string
  name: string
}

export async function validate(
  req: AuthenticatedRequest,
  res: Response
): Promise<UpdateValidationContext | null> {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  const { id } = req.params
  const { name } = req.body as { name?: string }

  // Validate UUID format
  if (!isValidUUID(id)) {
    sendBadRequest(res, 'INVALID_UUID')
    return null
  }

  // Validate name is provided and non-empty
  if (!name || typeof name !== 'string' || name.trim() === '') {
    sendBadRequest(res, 'INVALID_REQUEST')
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
    name,
  }
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: UpdateValidationContext
): Promise<void> {
  const updatedRecording = await updateRecordingName(context.recordingId, context.name)
  sendSuccess(res, updatedRecording as Recording)
}

export async function handler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const context = await validate(req, res)
  if (!context) return
  await processRequest(req, res, context)
}
