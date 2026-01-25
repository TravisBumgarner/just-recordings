import type { Response } from 'express'
import { getSharesByRecordingId, userOwnsRecording } from '../../db/queries/shares.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendNotFound, sendSuccess } from '../shared/responses.js'
import { isValidUUID } from '../shared/validation.js'

export interface ListSharesValidationContext {
  userId: string
  recordingId: string
  baseUrl: string
}

export async function validate(
  req: AuthenticatedRequest,
  res: Response
): Promise<ListSharesValidationContext | null> {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  const { id } = req.params

  // Validate UUID format
  if (!isValidUUID(id)) {
    sendBadRequest(res, 'INVALID_UUID')
    return null
  }

  // Check if user owns the recording
  const owns = await userOwnsRecording(id, auth.userId)
  if (!owns) {
    sendNotFound(res, 'RECORDING_NOT_FOUND')
    return null
  }

  // Get base URL for generating share URLs
  const protocol = req.protocol
  const host = req.get('host') || 'localhost'
  const baseUrl = `${protocol}://${host}`

  return {
    userId: auth.userId,
    recordingId: id,
    baseUrl,
  }
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: ListSharesValidationContext
): Promise<void> {
  const shares = await getSharesByRecordingId(context.recordingId, context.baseUrl)
  sendSuccess(res, { shares })
}

export async function handler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const context = await validate(req, res)
  if (!context) return
  await processRequest(req, res, context)
}
