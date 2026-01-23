import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { sendUnauthorized } from './responses.js'

export interface AuthResult {
  userId: string
}

export function requireUserId(req: AuthenticatedRequest, res: Response): AuthResult | null {
  const userId = req.user?.userId

  if (!userId) {
    sendUnauthorized(res)
    return null
  }

  return { userId }
}
