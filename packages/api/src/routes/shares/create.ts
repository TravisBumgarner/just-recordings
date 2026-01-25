import type { ShareType } from '@just-recordings/shared'
import type { Response } from 'express'
import config from '../../config.js'
import { createShare, userOwnsRecording } from '../../db/queries/shares.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendNotFound, sendSuccess } from '../shared/responses.js'
import { isValidUUID } from '../shared/validation.js'

export interface CreateShareValidationContext {
  userId: string
  recordingId: string
  shareType: ShareType
  baseUrl: string
}

const VALID_SHARE_TYPES = ['link', 'single_view'] as const

export async function validate(
  req: AuthenticatedRequest,
  res: Response
): Promise<CreateShareValidationContext | null> {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  const { id } = req.params
  const { shareType } = req.body

  // Validate UUID format
  if (!isValidUUID(id)) {
    sendBadRequest(res, 'INVALID_UUID')
    return null
  }

  // Validate shareType
  if (!shareType || !VALID_SHARE_TYPES.includes(shareType)) {
    sendBadRequest(res)
    return null
  }

  // Check if user owns the recording
  const owns = await userOwnsRecording(id, auth.userId)
  if (!owns) {
    // Could be not found or forbidden - we return 404 to not leak information
    sendNotFound(res, 'RECORDING_NOT_FOUND')
    return null
  }

  return {
    userId: auth.userId,
    recordingId: id,
    shareType: shareType as ShareType,
    baseUrl: config.frontendUrl,
  }
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: CreateShareValidationContext
): Promise<void> {
  const share = await createShare(context.recordingId, context.shareType, context.baseUrl)
  sendSuccess(res, { share }, 201)
}

export async function handler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const context = await validate(req, res)
  if (!context) return
  await processRequest(req, res, context)
}
