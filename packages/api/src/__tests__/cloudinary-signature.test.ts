import type { Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { processRequest, validate } from '../routes/cloudinary/signature.js'

// Mock config module
vi.mock('../config.js', () => ({
  default: {
    nodeEnv: 'development',
    cloudinary: {
      cloudName: 'test-cloud',
      isConfigured: true,
    },
  },
  getCloudinary: vi.fn(),
}))

import { getCloudinary } from '../config.js'

function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

function createMockRequest(user?: { userId: string; authId: string }): AuthenticatedRequest {
  return {
    user,
    body: {},
  } as AuthenticatedRequest
}

describe('cloudinary/signature', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validate', () => {
    it('returns null and sends 401 UNAUTHORIZED when user is not authenticated', () => {
      const req = createMockRequest(undefined)
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'UNAUTHORIZED' })
    })

    it('returns context with userId when user is authenticated', () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toEqual({
        userId: 'user-123',
      })
    })
  })

  describe('processRequest', () => {
    it('returns signature response with all required fields', () => {
      const mockCloudinary = {
        utils: {
          api_sign_request: vi.fn().mockReturnValue('test-signature'),
        },
        config: vi.fn().mockReturnValue({ api_secret: 'test-secret' }),
      }
      vi.mocked(getCloudinary).mockReturnValue(mockCloudinary as any)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = { userId: 'user-123' }

      processRequest(req, res, context)

      expect(res.status).toHaveBeenCalledWith(200)
      const jsonCall = vi.mocked(res.json).mock.calls[0][0]
      expect(jsonCall.success).toBe(true)
      expect(jsonCall.data).toHaveProperty('signature')
      expect(jsonCall.data).toHaveProperty('timestamp')
      expect(jsonCall.data).toHaveProperty('cloudName')
      expect(jsonCall.data).toHaveProperty('apiKey')
      expect(jsonCall.data).toHaveProperty('folder')
      expect(jsonCall.data).toHaveProperty('tags')
      expect(jsonCall.data).toHaveProperty('resourceType')
    })

    it('includes environment tag based on NODE_ENV', () => {
      const mockCloudinary = {
        utils: {
          api_sign_request: vi.fn().mockReturnValue('test-signature'),
        },
        config: vi.fn().mockReturnValue({ api_secret: 'test-secret' }),
      }
      vi.mocked(getCloudinary).mockReturnValue(mockCloudinary as any)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = { userId: 'user-123' }

      processRequest(req, res, context)

      const jsonCall = vi.mocked(res.json).mock.calls[0][0]
      expect(jsonCall.data.tags).toContain('env:development')
    })

    it('sets resourceType to video', () => {
      const mockCloudinary = {
        utils: {
          api_sign_request: vi.fn().mockReturnValue('test-signature'),
        },
        config: vi.fn().mockReturnValue({ api_secret: 'test-secret' }),
      }
      vi.mocked(getCloudinary).mockReturnValue(mockCloudinary as any)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = { userId: 'user-123' }

      processRequest(req, res, context)

      const jsonCall = vi.mocked(res.json).mock.calls[0][0]
      expect(jsonCall.data.resourceType).toBe('video')
    })

    it('generates timestamp as current unix time', () => {
      const mockCloudinary = {
        utils: {
          api_sign_request: vi.fn().mockReturnValue('test-signature'),
        },
        config: vi.fn().mockReturnValue({ api_secret: 'test-secret' }),
      }
      vi.mocked(getCloudinary).mockReturnValue(mockCloudinary as any)
      const nowSeconds = Math.floor(Date.now() / 1000)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = { userId: 'user-123' }

      processRequest(req, res, context)

      const jsonCall = vi.mocked(res.json).mock.calls[0][0]
      // Timestamp should be within 2 seconds of now
      expect(jsonCall.data.timestamp).toBeGreaterThanOrEqual(nowSeconds - 2)
      expect(jsonCall.data.timestamp).toBeLessThanOrEqual(nowSeconds + 2)
    })

    it('calls Cloudinary api_sign_request with correct parameters', () => {
      const mockApiSignRequest = vi.fn().mockReturnValue('test-signature')
      const mockCloudinary = {
        utils: {
          api_sign_request: mockApiSignRequest,
        },
        config: vi.fn().mockReturnValue({ api_secret: 'test-secret' }),
      }
      vi.mocked(getCloudinary).mockReturnValue(mockCloudinary as any)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = { userId: 'user-123' }

      processRequest(req, res, context)

      expect(mockApiSignRequest).toHaveBeenCalledTimes(1)
      const signParams = mockApiSignRequest.mock.calls[0][0]
      expect(signParams).toHaveProperty('timestamp')
      expect(signParams).toHaveProperty('folder')
      expect(signParams).toHaveProperty('tags')
    })
  })
})
