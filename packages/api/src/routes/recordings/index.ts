import { type Response, Router } from 'express'
import { type AuthenticatedRequest, requireAuth } from '../../middleware/auth.js'
import { validate as deleteValidate, processRequest as deleteProcessRequest } from './delete.js'
import { validate as getValidate, processRequest as getProcessRequest } from './get.js'
import { validate as listValidate, processRequest as listProcessRequest } from './list.js'
import { validate as thumbnailValidate, processRequest as thumbnailProcessRequest } from './thumbnail.js'
import { validate as videoValidate, processRequest as videoProcessRequest } from './video.js'

const router = Router()

// Apply auth middleware to all routes
router.use(requireAuth)

// GET /api/recordings - List all recordings for authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const context = listValidate(req, res)
  if (!context) return
  await listProcessRequest(req, res, context)
})

// GET /api/recordings/:id - Get single recording metadata (owned by user)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const context = await getValidate(req, res)
  if (!context) return
  getProcessRequest(req, res, context)
})

// GET /api/recordings/:id/video - Serve video file (owned by user)
router.get('/:id/video', async (req: AuthenticatedRequest, res: Response) => {
  const context = await videoValidate(req, res)
  if (!context) return
  await videoProcessRequest(req, res, context)
})

// GET /api/recordings/:id/thumbnail - Serve thumbnail image (owned by user)
router.get('/:id/thumbnail', async (req: AuthenticatedRequest, res: Response) => {
  const context = await thumbnailValidate(req, res)
  if (!context) return
  await thumbnailProcessRequest(req, res, context)
})

// DELETE /api/recordings/:id - Delete recording (owned by user)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const context = await deleteValidate(req, res)
  if (!context) return
  await deleteProcessRequest(req, res, context)
})

export { router as recordingsRouter }
