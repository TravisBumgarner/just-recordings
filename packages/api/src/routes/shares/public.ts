import type { Request, Response } from 'express'
import { getRecordingById } from '../../db/queries/recordings.js'
import { incrementViewCount, validateShare } from '../../db/queries/shares.js'
import { sendError, sendNotFound, sendSuccess } from '../shared/responses.js'

/**
 * GET /api/share/:token - Get public recording metadata
 */
export async function getPublicRecordingHandler(req: Request, res: Response): Promise<void> {
  const { token } = req.params

  if (!token || token.length === 0) {
    sendNotFound(res, 'SHARE_NOT_FOUND')
    return
  }

  const validation = await validateShare(token)

  if (!validation.valid) {
    sendError(res, validation.error, validation.error === 'SHARE_NOT_FOUND' ? 404 : 410)
    return
  }

  const recording = await getRecordingById(validation.recordingId)

  if (!recording) {
    sendNotFound(res, 'RECORDING_NOT_FOUND')
    return
  }

  // Return public recording info (subset of full recording data)
  sendSuccess(res, {
    recording: {
      id: recording.id,
      name: recording.name,
      duration: recording.duration,
      createdAt: recording.createdAt,
    },
  })
}

/**
 * GET /api/share/:token/video - Stream video for a shared recording
 */
export async function getPublicVideoHandler(req: Request, res: Response): Promise<void> {
  const { token } = req.params

  if (!token || token.length === 0) {
    sendNotFound(res, 'SHARE_NOT_FOUND')
    return
  }

  const validation = await validateShare(token)

  if (!validation.valid) {
    sendError(res, validation.error, validation.error === 'SHARE_NOT_FOUND' ? 404 : 410)
    return
  }

  const recording = await getRecordingById(validation.recordingId)

  if (!recording || !recording.videoUrl) {
    sendNotFound(res, 'FILE_NOT_FOUND')
    return
  }

  // Increment view count
  await incrementViewCount(validation.share.id)

  // Redirect to video URL
  res.redirect(302, recording.videoUrl)
}

/**
 * GET /api/share/:token/thumbnail - Get thumbnail for a shared recording
 */
export async function getPublicThumbnailHandler(req: Request, res: Response): Promise<void> {
  const { token } = req.params

  if (!token || token.length === 0) {
    sendNotFound(res, 'SHARE_NOT_FOUND')
    return
  }

  const validation = await validateShare(token)

  if (!validation.valid) {
    sendError(res, validation.error, validation.error === 'SHARE_NOT_FOUND' ? 404 : 410)
    return
  }

  const recording = await getRecordingById(validation.recordingId)

  if (!recording || !recording.thumbnailUrl) {
    sendNotFound(res, 'THUMBNAIL_NOT_FOUND')
    return
  }

  // Redirect to thumbnail URL
  res.redirect(302, recording.thumbnailUrl)
}
