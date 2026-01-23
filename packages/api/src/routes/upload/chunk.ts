import type { Response } from 'express'
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

export function validate(req: AuthenticatedRequest, res: Response): ChunkValidationContext | null {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  const { uploadId } = req.params
  const indexStr = req.body.index || '0'

  // Validate uploadId format
  if (!isValidUUID(uploadId)) {
    sendBadRequest(res, 'INVALID_UUID')
    return null
  }

  // Validate chunk index
  if (!isValidChunkIndex(indexStr)) {
    sendBadRequest(res, 'INVALID_CHUNK_INDEX')
    return null
  }

  // Check if upload session exists and user owns it
  const session = getUploadSession(uploadId)
  if (!session) {
    // Session doesn't exist - treat as bad request (upload not started)
    sendBadRequest(res, 'INVALID_UUID')
    return null
  }

  if (session.userId !== auth.userId) {
    sendForbidden(res)
    return null
  }

  return {
    userId: auth.userId,
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

// Note: This handler is called AFTER multer middleware processes the file
export function handler(req: AuthenticatedRequest, res: Response): void {
  const context = validate(req, res)
  if (!context) return
  processRequest(req, res, context)
}
