import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../middleware/auth.js'

export interface ListValidationContext {
  userId: string
}

export function validate(
  req: AuthenticatedRequest,
  res: Response
): ListValidationContext | null {
  // Stub - returns null for now
  return null
}

export async function processRequest(
  req: AuthenticatedRequest,
  res: Response,
  context: ListValidationContext
): Promise<void> {
  // Stub - does nothing for now
}
