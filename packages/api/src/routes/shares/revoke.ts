import type { Response } from 'express'
import { revokeShare, userOwnsRecording } from '../../db/queries/shares.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendNotFound, sendSuccess } from '../shared/responses.js'
import { isValidUUID } from '../shared/validation.js'

export interface RevokeShareValidationContext {
  userId: string
  recordingId: string
  shareId: string
}

export async function validate(
  req: AuthenticatedRequest,
  res: Response
): Promise<RevokeShareValidationContext | null> {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  const { id, shareId } = req.params

  // Validate UUID formats
  if (!isValidUUID(id) || !isValidUUID(shareId)) {
    sendBadRequest(res, 'INVALID_UUID')
    return null
  }

  // Check if user owns the recording
  const owns = await userOwnsRecording(id, auth.userId)
  if (!owns) {
    sendNotFound(res, 'RECORDING_NOT_FOUND')
    return null
  }

  return {
    userId: auth.userId,
    recordingId: id,
    shareId,
  }
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: RevokeShareValidationContext
): Promise<void> {
  const revoked = await revokeShare(context.shareId, context.recordingId)

  if (!revoked) {
    sendNotFound(res, 'SHARE_NOT_FOUND')
    return
  }

  sendSuccess(res, { revoked: true })
}

export async function handler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const context = await validate(req, res)
  if (!context) return
  await processRequest(req, res, context)
}
