import type { Recording } from '@just-recordings/shared'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth.js'

export interface GetValidationContext {
  userId: string
  recordingId: string
  recording: Recording
}

export function validate(
  _req: AuthenticatedRequest,
  _res: Response
): GetValidationContext | null {
  // Stub implementation
  return null
}

export function processRequest(
  _req: AuthenticatedRequest,
  _res: Response,
  _context: GetValidationContext
): void {
  // Stub implementation
}
