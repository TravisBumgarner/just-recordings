import type { Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { processRequest, validate } from '../routes/recordings/create.js'

// Mock dependencies
vi.mock('../db/queries/recordings.js', () => ({
  saveRecording: vi.fn(),
}))

vi.mock('../config.js', () => ({
  default: {
    cloudinary: {
      cloudName: 'test-cloud',
    },
  },
}))

import { saveRecording } from '../db/queries/recordings.js'

function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

function createMockRequest(
  user?: { userId: string; authId: string },
  body: Record<string, unknown> = {}
): AuthenticatedRequest {
  return {
    user,
    body,
  } as AuthenticatedRequest
}

describe('recordings/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validate', () => {
    it('returns null and sends 401 UNAUTHORIZED when user is not authenticated', async () => {
      const req = createMockRequest(undefined, {
        cloudinaryPublicId: 'recordings/abc123',
        cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/abc123.webm',
        filename: 'test.webm',
        duration: 60000,
      })
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'UNAUTHORIZED' })
    })

    it('returns null and sends 400 INVALID_INPUT when cloudinaryPublicId is missing', async () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, {
        cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/abc123.webm',
        filename: 'test.webm',
        duration: 60000,
      })
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_INPUT' })
    })

    it('returns null and sends 400 INVALID_INPUT when cloudinaryUrl is missing', async () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, {
        cloudinaryPublicId: 'recordings/abc123',
        filename: 'test.webm',
        duration: 60000,
      })
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_INPUT' })
    })

    it('returns null and sends 400 INVALID_INPUT when filename is missing', async () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, {
        cloudinaryPublicId: 'recordings/abc123',
        cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/abc123.webm',
        duration: 60000,
      })
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_INPUT' })
    })

    it('returns null and sends 400 INVALID_INPUT when duration is missing', async () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, {
        cloudinaryPublicId: 'recordings/abc123',
        cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/abc123.webm',
        filename: 'test.webm',
      })
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_INPUT' })
    })

    it('returns null and sends 400 INVALID_INPUT when duration is not a number', async () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, {
        cloudinaryPublicId: 'recordings/abc123',
        cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/abc123.webm',
        filename: 'test.webm',
        duration: 'not-a-number',
      })
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_INPUT' })
    })

    it('returns context with validated data when all inputs are valid', async () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, {
        cloudinaryPublicId: 'recordings/abc123',
        cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/abc123.webm',
        filename: 'test.webm',
        duration: 60000,
      })
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toEqual({
        userId: 'user-123',
        cloudinaryPublicId: 'recordings/abc123',
        cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/abc123.webm',
        filename: 'test.webm',
        duration: 60000,
      })
    })
  })

  describe('processRequest', () => {
    it('saves recording to database and returns 201 with recording data', async () => {
      vi.mocked(saveRecording).mockResolvedValue(undefined)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = {
        userId: 'user-123',
        cloudinaryPublicId: 'recordings/abc123',
        cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/abc123.webm',
        filename: 'test.webm',
        duration: 60000,
      }

      await processRequest(req, res, context)

      expect(saveRecording).toHaveBeenCalledTimes(1)
      expect(res.status).toHaveBeenCalledWith(201)

      const jsonCall = vi.mocked(res.json).mock.calls[0][0]
      expect(jsonCall.success).toBe(true)
      expect(jsonCall.data).toHaveProperty('id')
      expect(jsonCall.data).toHaveProperty('videoUrl', context.cloudinaryUrl)
      expect(jsonCall.data).toHaveProperty('thumbnailUrl')
      expect(jsonCall.data).toHaveProperty('createdAt')
    })

    it('generates thumbnail URL using Cloudinary transformation', async () => {
      vi.mocked(saveRecording).mockResolvedValue(undefined)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = {
        userId: 'user-123',
        cloudinaryPublicId: 'recordings/abc123',
        cloudinaryUrl: 'https://res.cloudinary.com/test-cloud/video/upload/recordings/abc123.webm',
        filename: 'test.webm',
        duration: 60000,
      }

      await processRequest(req, res, context)

      const jsonCall = vi.mocked(res.json).mock.calls[0][0]
      // Thumbnail URL should use Cloudinary transformation
      expect(jsonCall.data.thumbnailUrl).toContain('test-cloud')
      expect(jsonCall.data.thumbnailUrl).toContain('c_thumb')
      expect(jsonCall.data.thumbnailUrl).toContain('recordings/abc123')
      expect(jsonCall.data.thumbnailUrl).toContain('.jpg')
    })

    it('saves recording with user association', async () => {
      vi.mocked(saveRecording).mockResolvedValue(undefined)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = {
        userId: 'user-123',
        cloudinaryPublicId: 'recordings/abc123',
        cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/abc123.webm',
        filename: 'test.webm',
        duration: 60000,
      }

      await processRequest(req, res, context)

      expect(saveRecording).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.webm',
          duration: 60000,
          videoUrl: context.cloudinaryUrl,
          videoPublicId: context.cloudinaryPublicId,
        }),
        'user-123'
      )
    })
  })
})
