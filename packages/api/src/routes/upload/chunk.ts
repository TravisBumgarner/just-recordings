import type { NextFunction, Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendForbidden } from '../shared/responses.js'
import { isValidChunkIndex, isValidUUID } from '../shared/validation.js'
import { getUploadSession } from './index.js'

export interface ChunkValidationContext {
  userId: string
  uploadId: string
  index: number
}

/**
 * Pre-upload validation middleware - runs BEFORE multer to prevent
 * unauthorized file uploads from being saved to disk.
 * Validates: auth, uploadId format, session exists, user owns session.
 */
export function validateBeforeUpload(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return

  const { uploadId } = req.params

  // Validate uploadId format
  if (!isValidUUID(uploadId)) {
    sendBadRequest(res, 'INVALID_UUID')
    return
  }

  // Check if upload session exists and user owns it
  const session = getUploadSession(uploadId)
  if (!session) {
    sendBadRequest(res, 'INVALID_UUID')
    return
  }

  if (session.userId !== auth.userId) {
    sendForbidden(res)
    return
  }

  // Validation passed, proceed to multer
  next()
}

export function validate(req: AuthenticatedRequest, res: Response): ChunkValidationContext | null {
  // Auth and ownership already validated by validateBeforeUpload middleware
  const { uploadId } = req.params
  const indexStr = req.body.index || '0'

  // Validate chunk index (only available after multer parses the form)
  if (!isValidChunkIndex(indexStr)) {
    sendBadRequest(res, 'INVALID_CHUNK_INDEX')
    return null
  }

  const userId = req.user?.userId
  if (!userId) return null // Should never happen after validateBeforeUpload

  return {
    userId,
    uploadId,
    index: parseInt(indexStr, 10),
  }
}

export function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: ChunkValidationContext
): void {
  const { index } = context

  // File has already been saved by multer middleware
  res.json({ received: true, index })
}

export function handler(req: AuthenticatedRequest, res: Response): void {
  const context = validate(req, res)
  if (!context) return
  processRequest(req, res, context)
}
