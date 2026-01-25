import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { handler as createHandler } from './create.js'
import { handler as listHandler } from './list.js'
import {
  getPublicRecordingHandler,
  getPublicThumbnailHandler,
  getPublicVideoHandler,
} from './public.js'
import { handler as revokeHandler } from './revoke.js'

// Authenticated routes for managing shares (mounted at /api/recordings/:id/shares)
const authenticatedRouter = Router({ mergeParams: true })
authenticatedRouter.use(requireAuth)

// POST /api/recordings/:id/shares - Create a new share
authenticatedRouter.post('/', createHandler)

// GET /api/recordings/:id/shares - List all shares for a recording
authenticatedRouter.get('/', listHandler)

// DELETE /api/recordings/:id/shares/:shareId - Revoke a share
authenticatedRouter.delete('/:shareId', revokeHandler)

// Public routes for accessing shared recordings (mounted at /api/share)
const publicRouter = Router()

// GET /api/share/:token - Get public recording metadata
publicRouter.get('/:token', getPublicRecordingHandler)

// GET /api/share/:token/video - Stream video for a shared recording
publicRouter.get('/:token/video', getPublicVideoHandler)

// GET /api/share/:token/thumbnail - Get thumbnail for a shared recording
publicRouter.get('/:token/thumbnail', getPublicThumbnailHandler)

export { authenticatedRouter as sharesAuthenticatedRouter, publicRouter as sharesPublicRouter }
