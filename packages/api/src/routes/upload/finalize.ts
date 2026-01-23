import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import type { Response } from 'express'
import ffmpeg from 'fluent-ffmpeg'
import { saveRecording } from '../../db/queries/recordings.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendForbidden, sendSuccess } from '../shared/responses.js'
import { isValidUUID } from '../shared/validation.js'
import { getUploadSession, removeUploadSession } from './index.js'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

export interface FinalizeValidationContext {
  userId: string
  uploadId: string
  totalChunks: number
  filename: string
  mimeType: string
  duration: number
  chunkDir: string
}

export function validate(req: AuthenticatedRequest, res: Response): FinalizeValidationContext | null {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  const { uploadId } = req.params
  const { totalChunks, filename, mimeType, duration } = req.body

  // Validate uploadId format
  if (!isValidUUID(uploadId)) {
    sendBadRequest(res, 'INVALID_UUID')
    return null
  }

  // Validate totalChunks is a positive integer
  const numChunks = parseInt(totalChunks, 10)
  if (!Number.isInteger(numChunks) || numChunks <= 0) {
    sendBadRequest(res, 'INVALID_INPUT')
    return null
  }

  // Check if upload session exists and user owns it
  const session = getUploadSession(uploadId)
  if (!session) {
    sendBadRequest(res, 'INVALID_UUID')
    return null
  }

  if (session.userId !== auth.userId) {
    sendForbidden(res)
    return null
  }

  return {
    userId: auth.userId,
    uploadId,
    totalChunks: numChunks,
    filename: filename || 'Untitled Recording',
    mimeType: mimeType || 'video/webm',
    duration: duration || 0,
    chunkDir: session.chunkDir,
  }
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: FinalizeValidationContext
): Promise<void> {
  const { uploadId, totalChunks, filename, mimeType, duration, chunkDir, userId } = context

  const uploadsDir = 'uploads'
  const fileId = randomUUID()
  const finalPath = path.join(uploadsDir, `${fileId}.webm`)

  // Ensure uploads directory exists
  await fs.mkdir(uploadsDir, { recursive: true })

  // Read and merge chunks in order
  const chunks: Buffer[] = []
  try {
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk-${i}`)
      const chunkData = await fs.readFile(chunkPath)
      chunks.push(chunkData)
    }
  } catch {
    sendBadRequest(res, 'MISSING_CHUNKS')
    return
  }

  // Write merged file
  const mergedData = Buffer.concat(chunks)
  await fs.writeFile(finalPath, mergedData)

  // Generate thumbnail from first frame
  const thumbnailPath = path.join(uploadsDir, `${fileId}-thumb.jpg`)
  let savedThumbnailPath: string | undefined

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(finalPath)
        .screenshots({
          timestamps: [0],
          filename: `${fileId}-thumb.jpg`,
          folder: uploadsDir,
          size: '320x?',
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
    })
    // Verify the thumbnail file was actually created
    await fs.access(thumbnailPath)
    savedThumbnailPath = thumbnailPath
  } catch {
    // Thumbnail generation failed, continue without it
  }

  // Save recording metadata with user association
  // Note: This uses local paths temporarily. Will be replaced with Cloudinary URLs
  // when the upload routes are removed (Task 8)
  await saveRecording(
    {
      id: fileId,
      name: filename,
      mimeType,
      duration,
      fileSize: mergedData.length,
      createdAt: new Date().toISOString(),
      videoUrl: finalPath,
      videoPublicId: fileId,
      thumbnailUrl: savedThumbnailPath,
      thumbnailPublicId: savedThumbnailPath ? `${fileId}-thumb` : undefined,
    },
    userId
  )

  // Cleanup temp directory
  await fs.rm(chunkDir, { recursive: true, force: true })

  // Remove upload session
  removeUploadSession(uploadId)

  sendSuccess(res, { fileId, path: finalPath, size: mergedData.length })
}

export async function handler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const context = validate(req, res)
  if (!context) return
  await processRequest(req, res, context)
}
