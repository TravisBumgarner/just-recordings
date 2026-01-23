import type { Response } from 'express'
import type { Recording } from '@just-recordings/shared'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendSuccess } from '../shared/responses.js'

export interface CreateRecordingValidationContext {
  userId: string
  cloudinaryPublicId: string
  cloudinaryUrl: string
  filename: string
  duration: number
}

export interface CreateRecordingResponse {
  id: string
  videoUrl: string
  thumbnailUrl: string
  createdAt: string
}

export async function validate(
  req: AuthenticatedRequest,
  res: Response
): Promise<CreateRecordingValidationContext | null> {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  // TODO: Validate request body
  const { cloudinaryPublicId, cloudinaryUrl, filename, duration } = req.body

  // Stub: Return null for now
  return null
}

export function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  _context: CreateRecordingValidationContext
): void {
  // Stub: Return empty response
  sendSuccess(res, {}, 201)
}

export async function handler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const context = await validate(req, res)
  if (!context) return
  processRequest(req, res, context)
}
