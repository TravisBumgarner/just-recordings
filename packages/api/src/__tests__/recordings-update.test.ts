import type { Recording } from '@just-recordings/shared'
import type { Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { processRequest, validate } from '../routes/recordings/update.js'

// Mock dependencies
vi.mock('../db/queries/recordings.js', () => ({
  getRecordingById: vi.fn(),
  updateRecordingName: vi.fn(),
}))

import { getRecordingById, updateRecordingName } from '../db/queries/recordings.js'

function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

function createMockRequest(
  user?: { userId: string; authId: string },
  params: Record<string, string> = {},
  body: Record<string, unknown> = {}
): AuthenticatedRequest {
  return {
    user,
    params,
    body,
  } as AuthenticatedRequest
}

function createMockRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Recording',
    mimeType: 'video/webm',
    duration: 60000,
    fileSize: 1024000,
    createdAt: '2026-01-15T10:00:00Z',
    videoUrl: 'https://res.cloudinary.com/test/video/upload/test.webm',
    videoPublicId: 'test',
    ...overrides,
  }
}

describe('recordings/update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validate', () => {
    it('returns null and sends 401 UNAUTHORIZED when user is not authenticated', async () => {
      const req = createMockRequest(
        undefined,
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        { name: 'New Name' }
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'UNAUTHORIZED' })
    })

    it('returns null and sends 400 INVALID_UUID when id is not a valid UUID', async () => {
      const req = createMockRequest(
        { userId: 'user-123', authId: 'auth-123' },
        { id: 'not-a-uuid' },
        { name: 'New Name' }
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_UUID' })
    })

    it('returns null and sends 400 INVALID_REQUEST when name is missing', async () => {
      const req = createMockRequest(
        { userId: 'user-123', authId: 'auth-123' },
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        {} // No name in body
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_REQUEST' })
    })

    it('returns null and sends 400 INVALID_REQUEST when name is empty string', async () => {
      const req = createMockRequest(
        { userId: 'user-123', authId: 'auth-123' },
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        { name: '' }
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_REQUEST' })
    })

    it('returns null and sends 404 RECORDING_NOT_FOUND when recording does not exist', async () => {
      vi.mocked(getRecordingById).mockResolvedValue(null)

      const req = createMockRequest(
        { userId: 'user-123', authId: 'auth-123' },
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        { name: 'New Name' }
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'RECORDING_NOT_FOUND' })
    })

    it('returns null and sends 403 FORBIDDEN when user does not own the recording', async () => {
      const recording = createMockRecording()
      // Recording exists (first call), but user doesn't own it (second call returns null)
      vi.mocked(getRecordingById)
        .mockResolvedValueOnce(recording)
        .mockResolvedValueOnce(null)

      const req = createMockRequest(
        { userId: 'different-user', authId: 'auth-123' },
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        { name: 'New Name' }
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'FORBIDDEN' })
    })

    it('returns context when all validations pass', async () => {
      const recording = createMockRecording()
      vi.mocked(getRecordingById)
        .mockResolvedValueOnce(recording)
        .mockResolvedValueOnce(recording)

      const req = createMockRequest(
        { userId: 'user-123', authId: 'auth-123' },
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        { name: 'New Name' }
      )
      const res = createMockResponse()

      const result = await validate(req, res)

      expect(result).toEqual({
        userId: 'user-123',
        recordingId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'New Name',
      })
    })
  })

  describe('processRequest', () => {
    it('updates recording name and sends updated recording', async () => {
      const updatedRecording = createMockRecording({ name: 'Updated Name' })
      vi.mocked(updateRecordingName).mockResolvedValue(updatedRecording)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = {
        userId: 'user-123',
        recordingId: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Name',
      }

      await processRequest(req, res, context)

      expect(updateRecordingName).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'Updated Name'
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedRecording,
      })
    })
  })
})
