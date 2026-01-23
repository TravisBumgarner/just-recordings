import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { handler as signatureHandler } from './signature.js'

const router = Router()

// All cloudinary routes require authentication
router.use(requireAuth)

// POST /api/upload/signature - Get Cloudinary upload signature
router.post('/signature', signatureHandler)

export { router as cloudinaryRouter }
