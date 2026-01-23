import fs from 'node:fs/promises'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendSuccess } from '../shared/responses.js'
import { createUploadSession } from './index.js'

export interface StartValidationContext {
  userId: string
}

export function validate(req: AuthenticatedRequest, res: Response): StartValidationContext | null {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  return {
    userId: auth.userId,
  }
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: StartValidationContext
): Promise<void> {
  const { userId } = context

  // Create upload session
  const session = createUploadSession(userId)

  // Create temp directory for chunks
  await fs.mkdir(session.chunkDir, { recursive: true })

  sendSuccess(res, { uploadId: session.uploadId })
}
