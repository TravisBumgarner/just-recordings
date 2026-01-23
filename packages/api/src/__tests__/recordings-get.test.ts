import type { Recording } from '@just-recordings/shared'
import type { Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { processRequest, validate } from '../routes/recordings/get.js'

// Mock dependencies
vi.mock('../db/queries/recordings.js', () => ({
  getRecordingById: vi.fn(),
}))

import { getRecordingById } from '../db/queries/recordings.js'

function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

function createMockRequest(
  user?: { userId: string; authId: string },
  params: Record<string, string> = {}
): AuthenticatedRequest {
  return {
    user,
    params,
  } as AuthenticatedRequest
}

function createMockRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    id: 'rec-123',
    name: 'Test Recording',
    mimeType: 'video/webm',
    duration: 60000,
    fileSize: 1024000,
    createdAt: '2026-01-15T10:00:00Z',
    path: '/uploads/test.webm',
    ...overrides,
  }
}

describe('recordings/get', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validate', () => {
    it('returns null and sends 401 UNAUTHORIZED when user is not authenticated', () => {
      const req = createMockRequest(undefined, { id: 'rec-123' })
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'UNAUTHORIZED' })
    })

    it('returns null and sends 400 INVALID_UUID when id is not a valid UUID', () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, { id: 'not-a-uuid' })
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_UUID' })
    })

    it('returns null and sends 404 RECORDING_NOT_FOUND when recording does not exist', async () => {
      // Recording doesn't exist at all (query without userId returns null)
      vi.mocked(getRecordingById).mockResolvedValue(null)

      const req = createMockRequest(
        { userId: 'user-123', authId: 'auth-123' },
        { id: '550e8400-e29b-41d4-a716-446655440000' }
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'RECORDING_NOT_FOUND' })
    })

    it('returns null and sends 403 FORBIDDEN when user does not own the recording', async () => {
      const recording = createMockRecording({ id: '550e8400-e29b-41d4-a716-446655440000' })
      // Recording exists (first call without userId), but user doesn't own it (second call with userId returns null)
      vi.mocked(getRecordingById)
        .mockResolvedValueOnce(recording) // First call: check existence
        .mockResolvedValueOnce(null) // Second call: check ownership

      const req = createMockRequest(
        { userId: 'different-user', authId: 'auth-123' },
        { id: '550e8400-e29b-41d4-a716-446655440000' }
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'FORBIDDEN' })
    })

    it('returns context with recording when all validations pass', async () => {
      const recording = createMockRecording({ id: '550e8400-e29b-41d4-a716-446655440000' })
      // Recording exists and user owns it
      vi.mocked(getRecordingById)
        .mockResolvedValueOnce(recording) // First call: check existence
        .mockResolvedValueOnce(recording) // Second call: check ownership

      const req = createMockRequest(
        { userId: 'user-123', authId: 'auth-123' },
        { id: '550e8400-e29b-41d4-a716-446655440000' }
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toEqual({
        userId: 'user-123',
        recordingId: '550e8400-e29b-41d4-a716-446655440000',
        recording,
      })
    })
  })

  describe('processRequest', () => {
    it('sends recording data wrapped in success response', () => {
      const recording = createMockRecording()
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = {
        userId: 'user-123',
        recordingId: 'rec-123',
        recording,
      }

      processRequest(req, res, context)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: recording,
      })
    })
  })
})
