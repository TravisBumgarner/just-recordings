import type { Recording } from '@just-recordings/shared'
import type { Response } from 'express'
import fs from 'node:fs/promises'
import { getRecordingById } from '../../db/queries/recordings.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendForbidden, sendNotFound } from '../shared/responses.js'
import { isValidUUID } from '../shared/validation.js'

export interface VideoValidationContext {
  userId: string
  recordingId: string
  recording: Recording
}

export async function validate(
  req: AuthenticatedRequest,
  res: Response
): Promise<VideoValidationContext | null> {
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

  // Check if video file exists on disk
  try {
    await fs.access(ownedRecording.path)
  } catch {
    sendNotFound(res, 'FILE_NOT_FOUND')
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
  context: VideoValidationContext
): Promise<void> {
  res.setHeader('Content-Type', context.recording.mimeType)
  const fileContent = await fs.readFile(context.recording.path)
  res.send(fileContent)
}
