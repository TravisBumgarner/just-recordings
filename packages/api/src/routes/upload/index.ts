import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { type NextFunction, type Request, type Response, Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../../middleware/auth.js'
import { isValidChunkIndex, isValidUUID } from '../shared/validation.js'
import { handler as chunkHandler } from './chunk.js'
import { handler as finalizeHandler } from './finalize.js'
import { handler as startHandler } from './start.js'

const router = Router()

// Upload session tracking
export interface UploadSession {
  userId: string
  uploadId: string
  chunkDir: string
  createdAt: Date
}

export const uploadSessions = new Map<string, UploadSession>()

// Configure multer with custom storage to handle chunk files
const storage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    const uploadId = req.params.uploadId
    // Validate uploadId to prevent path traversal
    if (!isValidUUID(uploadId)) {
      cb(new Error('Invalid upload ID'), '')
      return
    }
    const chunkDir = path.join('.tmp', uploadId)
    try {
      await fs.mkdir(chunkDir, { recursive: true })
      cb(null, chunkDir)
    } catch (error) {
      cb(error as Error, chunkDir)
    }
  },
  filename: (req, _file, cb) => {
    const index = req.body.index || '0'
    // Validate index to prevent path traversal
    if (!isValidChunkIndex(index)) {
      cb(new Error('Invalid chunk index'), '')
      return
    }
    cb(null, `chunk-${index}`)
  },
})

const upload = multer({ storage })

// Dev-only middleware - returns 404 if not in development
export function devOnly(_req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).json({ error: 'Not found' })
    return
  }
  next()
}

// Apply dev-only middleware to all routes, then require auth
router.use(devOnly)
router.use(requireAuth)

// POST /api/dev/upload/start - Create new upload session
router.post('/start', startHandler)

// POST /api/dev/upload/:uploadId/chunk - Upload a chunk
router.post('/:uploadId/chunk', upload.single('chunk'), chunkHandler)

// POST /api/dev/upload/:uploadId/finalize - Merge chunks into final file
router.post('/:uploadId/finalize', finalizeHandler)

// Helper to create upload session
export function createUploadSession(userId: string): UploadSession {
  const uploadId = randomUUID()
  const chunkDir = path.join('.tmp', uploadId)
  const session: UploadSession = {
    userId,
    uploadId,
    chunkDir,
    createdAt: new Date(),
  }
  uploadSessions.set(uploadId, session)
  return session
}

// Helper to get upload session
export function getUploadSession(uploadId: string): UploadSession | undefined {
  return uploadSessions.get(uploadId)
}

// Helper to remove upload session
export function removeUploadSession(uploadId: string): boolean {
  return uploadSessions.delete(uploadId)
}

export { router as uploadRouter }
