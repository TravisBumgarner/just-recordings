import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth.js'

export interface AuthResult {
  userId: string
}

export function requireUserId(req: AuthenticatedRequest, res: Response): AuthResult | null {
  // Stub - returns null for now
  return null
}
