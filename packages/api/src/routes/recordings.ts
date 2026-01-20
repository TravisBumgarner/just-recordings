import { Router, Request, Response } from 'express'
import fs from 'fs/promises'
import {
  getAllRecordings,
  getRecordingById,
  saveRecording,
  deleteRecording,
} from '../db/queries/recordings.js'

const router = Router()

// Re-export for use in upload.ts
export { saveRecording as saveRecordingMetadata }

// GET /api/recordings - List all recordings
router.get('/', async (_req: Request, res: Response) => {
  const recordings = await getAllRecordings()
  res.json({ recordings })
})

// GET /api/recordings/:id - Get single recording metadata
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const recording = await getRecordingById(id)

  if (!recording) {
    res.status(404).json({ error: 'Recording not found' })
    return
  }

  res.json(recording)
})

// GET /api/recordings/:id/video - Serve video file
router.get('/:id/video', async (req: Request, res: Response) => {
  const { id } = req.params
  const recording = await getRecordingById(id)

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

// GET /api/recordings/:id/thumbnail - Serve thumbnail image
router.get('/:id/thumbnail', async (req: Request, res: Response) => {
  const { id } = req.params
  const recording = await getRecordingById(id)

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

// DELETE /api/recordings/:id - Delete recording
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const recording = await getRecordingById(id)

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
