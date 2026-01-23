import type { Recording } from '@just-recordings/shared'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth.js'

export interface ThumbnailValidationContext {
  userId: string
  recordingId: string
  recording: Recording
}

export async function validate(
  _req: AuthenticatedRequest,
  _res: Response
): Promise<ThumbnailValidationContext | null> {
  // Stub implementation
  return null
}

export async function processRequest(
  _req: AuthenticatedRequest,
  _res: Response,
  _context: ThumbnailValidationContext
): Promise<void> {
  // Stub implementation
}
