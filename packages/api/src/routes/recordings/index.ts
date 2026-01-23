import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { handler as deleteHandler } from './delete.js'
import { handler as getHandler } from './get.js'
import { handler as listHandler } from './list.js'
import { handler as thumbnailHandler } from './thumbnail.js'
import { handler as videoHandler } from './video.js'

const router = Router()

// Apply auth middleware to all routes
router.use(requireAuth)

// GET /api/recordings - List all recordings for authenticated user
router.get('/', listHandler)

// GET /api/recordings/:id - Get single recording metadata (owned by user)
router.get('/:id', getHandler)

// GET /api/recordings/:id/video - Serve video file (owned by user)
router.get('/:id/video', videoHandler)

// GET /api/recordings/:id/thumbnail - Serve thumbnail image (owned by user)
router.get('/:id/thumbnail', thumbnailHandler)

// DELETE /api/recordings/:id - Delete recording (owned by user)
router.delete('/:id', deleteHandler)

export { router as recordingsRouter }
