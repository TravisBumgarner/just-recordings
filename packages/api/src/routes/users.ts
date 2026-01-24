import { Router } from 'express'
import { getOrCreateUserByAuth } from '../db/queries/users.js'
import { type AuthenticatedRequest, requireAuth } from '../middleware/auth.js'
import { sendInternalError, sendSuccess, sendUnauthorized } from './shared/responses.js'

const router = Router()

// Get current user profile (creates user if doesn't exist)
router.get('/me', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest

  if (!authReq.user) {
    sendUnauthorized(res)
    return
  }

  try {
    const user = await getOrCreateUserByAuth({
      authId: authReq.user.authId,
      email: authReq.user.email || '',
    })

    sendSuccess(res, {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    sendInternalError(res)
  }
})

export { router as usersRouter }
