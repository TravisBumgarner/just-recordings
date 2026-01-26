import type { Response } from 'express'
import { getRecordingsPage, getRecordingsCount } from '../../db/queries/recordings.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendSuccess } from '../shared/responses.js'

const DEFAULT_LIMIT = 20

export interface ListValidationContext {
  userId: string
  limit: number
  offset: number
}

export function validate(
  req: AuthenticatedRequest,
  res: Response
): ListValidationContext | null {
  const auth = requireUserId(req, res)
  if (!auth) return null

  const limitParam = parseInt(req.query.limit as string, 10)
  const offsetParam = parseInt(req.query.offset as string, 10)

  const limit = Number.isNaN(limitParam) || limitParam <= 0 ? DEFAULT_LIMIT : limitParam
  const offset = Number.isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam

  return { userId: auth.userId, limit, offset }
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: ListValidationContext
): Promise<void> {
  const [recordings, total] = await Promise.all([
    getRecordingsPage(context.userId, context.limit, context.offset),
    getRecordingsCount(context.userId),
  ])
  sendSuccess(res, { recordings, total })
}

export async function handler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const context = validate(req, res)
  if (!context) return
  await processRequest(req, res, context)
}
