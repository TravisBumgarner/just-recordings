import { describe, expect, it, vi } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import { requireUserId } from '../routes/shared/auth.js'

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

describe('requireUserId', () => {
  it('returns { userId } when user is authenticated', () => {
    const req = createMockRequest({ userId: 'user-123', authId: 'auth-123' })
    const res = createMockResponse()

    const result = requireUserId(req, res)

    expect(result).toEqual({ userId: 'user-123' })
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('returns null and sends 401 when user is undefined', () => {
    const req = createMockRequest(undefined)
    const res = createMockResponse()

    const result = requireUserId(req, res)

    expect(result).toBeNull()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'UNAUTHORIZED' })
  })

  it('returns null and sends 401 when userId is missing from user object', () => {
    const req = createMockRequest({ userId: '', authId: 'auth-123' })
    const res = createMockResponse()

    const result = requireUserId(req, res)

    expect(result).toBeNull()
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'UNAUTHORIZED' })
  })
})
