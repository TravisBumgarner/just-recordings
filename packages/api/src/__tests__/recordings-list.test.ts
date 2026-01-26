import { describe, expect, it, vi } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { validate, processRequest } from '../routes/recordings/list.js'

// Mock recording queries
vi.mock('../db/queries/recordings.js', () => ({
  getRecordingsPage: vi.fn(),
  getRecordingsCount: vi.fn(),
}))

import { getRecordingsPage, getRecordingsCount } from '../db/queries/recordings.js'

function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

function createMockRequest(
  user?: { userId: string; authId: string },
  query: Record<string, string> = {}
): AuthenticatedRequest {
  return {
    user,
    query,
  } as AuthenticatedRequest
}

describe('recordings/list', () => {
  describe('validate', () => {
    it('returns context with default pagination when no query params provided', () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toEqual({ userId: 'user-123', limit: 20, offset: 0 })
    })

    it('returns context with custom limit and offset from query params', () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, { limit: '10', offset: '5' })
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toEqual({ userId: 'user-123', limit: 10, offset: 5 })
    })

    it('returns null and sends 401 when user is not authenticated', () => {
      const req = createMockRequest(undefined)
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toBeNull()
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'UNAUTHORIZED' })
    })

    it('uses default limit when limit is invalid', () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, { limit: 'invalid' })
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toEqual({ userId: 'user-123', limit: 20, offset: 0 })
    })

    it('uses 0 offset when offset is negative', () => {
      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' }, { offset: '-5' })
      const res = createMockResponse()

      const result = validate(req, res)

      expect(result).toEqual({ userId: 'user-123', limit: 20, offset: 0 })
    })
  })

  describe('processRequest', () => {
    it('returns paginated recordings with total count', async () => {
      const mockRecordings = [
        { id: 'rec-1', name: 'Recording 1' },
        { id: 'rec-2', name: 'Recording 2' },
      ]
      vi.mocked(getRecordingsPage).mockResolvedValue(mockRecordings as any)
      vi.mocked(getRecordingsCount).mockResolvedValue(25)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = { userId: 'user-123', limit: 20, offset: 0 }

      await processRequest(req, res, context)

      expect(getRecordingsPage).toHaveBeenCalledWith('user-123', 20, 0)
      expect(getRecordingsCount).toHaveBeenCalledWith('user-123')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { recordings: mockRecordings, total: 25 },
      })
    })

    it('returns empty array with zero total when user has no recordings', async () => {
      vi.mocked(getRecordingsPage).mockResolvedValue([])
      vi.mocked(getRecordingsCount).mockResolvedValue(0)

      const req = createMockRequest({ userId: 'user-456', authId: 'auth-456' })
      const res = createMockResponse()
      const context = { userId: 'user-456', limit: 20, offset: 0 }

      await processRequest(req, res, context)

      expect(getRecordingsPage).toHaveBeenCalledWith('user-456', 20, 0)
      expect(getRecordingsCount).toHaveBeenCalledWith('user-456')
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { recordings: [], total: 0 },
      })
    })

    it('uses custom limit and offset for pagination', async () => {
      vi.mocked(getRecordingsPage).mockResolvedValue([])
      vi.mocked(getRecordingsCount).mockResolvedValue(50)

      const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
      const res = createMockResponse()
      const context = { userId: 'user-123', limit: 10, offset: 20 }

      await processRequest(req, res, context)

      expect(getRecordingsPage).toHaveBeenCalledWith('user-123', 10, 20)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { recordings: [], total: 50 },
      })
    })
  })
})
