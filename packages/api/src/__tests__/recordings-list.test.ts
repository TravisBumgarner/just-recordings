import { describe, expect, it, vi } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { validate, processRequest } from '../routes/recordings/list.js'

// Mock getAllRecordings
vi.mock('../db/queries/recordings.js', () => ({
  getAllRecordings: vi.fn(),
}))

import { getAllRecordings } from '../db/queries/recordings.js'

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
  } as AuthenticatedRequest
}

describe('recordings/list', () => {
  describe('validate', () => {
    it('returns { userId } when user is authenticated', () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toEqual({ userId: 'user-123' })
    })

    it('returns null and sends 401 when user is not authenticated', () => {
      const req = createMockRequest(undefined)
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'UNAUTHORIZED' })
    })
  })

  describe('processRequest', () => {
    it('returns recordings wrapped in success response', async () => {
      const mockRecordings = [
        { id: 'rec-1', name: 'Recording 1' },
        { id: 'rec-2', name: 'Recording 2' },
      ]
      vi.mocked(getAllRecordings).mockResolvedValue(mockRecordings as any)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = { userId: 'user-123' }

      await processRequest(req, res, context)

      expect(getAllRecordings).toHaveBeenCalledWith('user-123')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { recordings: mockRecordings },
      })
    })

    it('returns empty array when user has no recordings', async () => {
      vi.mocked(getAllRecordings).mockResolvedValue([])

      const req = createMockRequest({ userId: 'user-456', authId: 'auth-456' })
      const res = createMockResponse()
      const context = { userId: 'user-456' }

      await processRequest(req, res, context)

      expect(getAllRecordings).toHaveBeenCalledWith('user-456')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { recordings: [] },
      })
    })
  })
})
