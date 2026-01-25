import type { NextFunction, Request, Response } from 'express'
import { getOrCreateUserByAuth, getUserByAuthId } from '../db/queries/users.js'
import { supabase } from '../lib/supabase.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    authId: string
    userId: string
    email?: string
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' })
    return
  }

  const token = authHeader.substring(7)

  if (!supabase) {
    res.status(500).json({ error: 'Auth service not configured' })
    return
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  let user = await getUserByAuthId(data.user.id)

  if (!user) {
    // Create user record if it doesn't exist
    user = await getOrCreateUserByAuth({ authId: data.user.id, email: data.user.email ?? '' })
  }

  req.user = {
    authId: data.user.id,
    userId: user?.id,
    email: data.user.email,
  }

  next()
}
