import type { Response } from 'express'
import config, { getCloudinary } from '../../config.js'
import type { AuthenticatedRequest } from '../../middleware/auth.js'
import { requireUserId } from '../shared/auth.js'
import { sendSuccess } from '../shared/responses.js'

export interface SignatureValidationContext {
  userId: string
}

export interface SignatureResponse {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  tags: string[]
  resourceType: string
}

export function validate(req: AuthenticatedRequest, res: Response): SignatureValidationContext | null {
  // Check authentication
  const auth = requireUserId(req, res)
  if (!auth) return null

  return {
    userId: auth.userId,
  }
}

export function processRequest(
  _req: AuthenticatedRequest,
  res: Response,
  _context: SignatureValidationContext
): void {
  const cloudinary = getCloudinary()

  // Generate timestamp (current unix time in seconds)
  const timestamp = Math.floor(Date.now() / 1000)

  // Set up folder and tags
  const folder = 'recordings'
  const envTag = `env:${config.nodeEnv}`
  const tags = [envTag]
  const resourceType = 'video'

  // Parameters to sign
  const paramsToSign = {
    timestamp,
    folder,
    tags: tags.join(','),
  }

  // Generate signature using Cloudinary's utility
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    cloudinary.config().api_secret as string
  )

  const response: SignatureResponse = {
    signature,
    timestamp,
    cloudName: config.cloudinary.cloudName,
    apiKey: config.cloudinary.apiKey,
    folder,
    tags,
    resourceType,
  }

  sendSuccess(res, response)
}

export function handler(req: AuthenticatedRequest, res: Response): void {
  const context = validate(req, res)
  if (!context) return
  processRequest(req, res, context)
}
