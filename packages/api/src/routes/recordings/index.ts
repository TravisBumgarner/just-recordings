import fs from 'node:fs/promises'
import { type Response, Router } from 'express'
import { deleteRecording, getRecordingById } from '../../db/queries/recordings.js'
import { type AuthenticatedRequest, requireAuth } from '../../middleware/auth.js'
import { validate as listValidate, processRequest as listProcessRequest } from './list.js'

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
  const { id } = req.params
  const userId = req.user?.userId
  const recording = await getRecordingById(id, userId)

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' })
    return
  }

  res.json(recording)
})

// GET /api/recordings/:id/video - Serve video file (owned by user)
router.get('/:id/video', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const userId = req.user?.userId
  const recording = await getRecordingById(id, userId)

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' })
    return
  }

  // Check if file exists
  try {
    await fs.access(recording.path)
  } catch {
    res.status(404).json({ error: 'Video file not found' })
    return
  }

  res.setHeader('Content-Type', recording.mimeType)
  const fileContent = await fs.readFile(recording.path)
  res.send(fileContent)
})

// GET /api/recordings/:id/thumbnail - Serve thumbnail image (owned by user)
router.get('/:id/thumbnail', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const userId = req.user?.userId
  const recording = await getRecordingById(id, userId)

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' })
    return
  }

  if (!recording.thumbnailPath) {
    res.status(404).json({ error: 'Thumbnail not found' })
    return
  }

  try {
    await fs.access(recording.thumbnailPath)
  } catch {
    res.status(404).json({ error: 'Thumbnail file not found' })
    return
  }

  res.setHeader('Content-Type', 'image/jpeg')
  const fileContent = await fs.readFile(recording.thumbnailPath)
  res.send(fileContent)
})

// DELETE /api/recordings/:id - Delete recording (owned by user)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params
  const userId = req.user?.userId
  const recording = await getRecordingById(id, userId)

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' })
    return
  }

  // Delete video file
  try {
    await fs.unlink(recording.path)
  } catch {
    // File might already be deleted, continue
  }

  // Delete thumbnail file if it exists
  if (recording.thumbnailPath) {
    try {
      await fs.unlink(recording.thumbnailPath)
    } catch {
      // Thumbnail might already be deleted, continue
    }
  }

  // Remove from database
  await deleteRecording(id)

  res.json({ success: true })
})

export { router as recordingsRouter }
