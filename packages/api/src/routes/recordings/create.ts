import { randomUUID } from 'node:crypto'
import type { Response } from 'express'
import type { Recording } from '@just-recordings/shared'
import config from '../../config.js'
import { saveRecording } from '../../db/queries/recordings.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendBadRequest, sendSuccess } from '../shared/responses.js'

export interface CreateRecordingValidationContext {
  userId: string
  cloudinaryPublicId: string
  cloudinaryUrl: string
  filename: string
  duration: number
}

export interface CreateRecordingResponse {
  id: string
  videoUrl: string
  thumbnailUrl: string
  createdAt: string
}

export async function validate(
  req: AuthenticatedRequest,
  res: Response
): Promise<CreateRecordingValidationContext | null> {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  // Validate request body
  const { cloudinaryPublicId, cloudinaryUrl, filename, duration } = req.body

  // Check required fields
  if (
    typeof cloudinaryPublicId !== 'string' ||
    typeof cloudinaryUrl !== 'string' ||
    typeof filename !== 'string' ||
    typeof duration !== 'number'
  ) {
    sendBadRequest(res)
    return null
  }

  return {
    userId: auth.userId,
    cloudinaryPublicId,
    cloudinaryUrl,
    filename,
    duration,
  }
}

/**
 * Generate a Cloudinary thumbnail URL using transformations
 * Format: https://res.cloudinary.com/{cloud}/video/upload/c_thumb,w_320,h_180/{public_id}.jpg
 */
function generateThumbnailUrl(cloudName: string, publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/video/upload/c_thumb,w_320,h_180/${publicId}.jpg`
}

export async function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  context: CreateRecordingValidationContext
): Promise<void> {
  const { userId, cloudinaryPublicId, cloudinaryUrl, filename, duration } = context

  // Generate ID and timestamps
  const id = randomUUID()
  const createdAt = new Date().toISOString()

  // Generate thumbnail URL using Cloudinary transformation
  const thumbnailUrl = generateThumbnailUrl(config.cloudinary.cloudName, cloudinaryPublicId)

  // Create recording object
  const recording: Recording = {
    id,
    name: filename,
    mimeType: 'video/webm',
    duration,
    fileSize: 0, // Size not available from Cloudinary upload response
    createdAt,
    videoUrl: cloudinaryUrl,
    videoPublicId: cloudinaryPublicId,
    thumbnailUrl,
    thumbnailPublicId: cloudinaryPublicId, // Same as video since thumbnail is generated via transformation
  }

  // Save to database
  await saveRecording(recording, userId)

  // Return response
  const response: CreateRecordingResponse = {
    id,
    videoUrl: cloudinaryUrl,
    thumbnailUrl,
    createdAt,
  }

  sendSuccess(res, response, 201)
}

export async function handler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const context = await validate(req, res)
  if (!context) return
  await processRequest(req, res, context)
}
