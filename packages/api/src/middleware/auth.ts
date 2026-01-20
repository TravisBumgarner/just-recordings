import type { NextFunction, Request, Response } from 'express'
import { supabase } from '../lib/supabase.js'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
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

  req.user = {
    id: data.user.id,
    email: data.user.email,
  }

  next()
}
