import { describe, expect, it, vi } from 'vitest'
import type { Response } from 'express'
import {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendBadRequest,
  sendInternalError,
} from '../routes/shared/responses.js'

function createMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res as unknown as Response
}

describe('sendSuccess', () => {
  it('sends { success: true, data } with status 200 by default', () => {
    const res = createMockResponse()
    const data = { items: [1, 2, 3] }

    sendSuccess(res, data)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ success: true, data })
  })

  it('uses custom status code when provided', () => {
    const res = createMockResponse()
    const data = { id: 'abc' }

    sendSuccess(res, data, 201)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ success: true, data })
  })
})

describe('sendError', () => {
  it('sends { success: false, errorCode } with specified status', () => {
    const res = createMockResponse()

    sendError(res, 'NOT_FOUND', 404)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'NOT_FOUND' })
  })
})

describe('sendUnauthorized', () => {
  it('sends 401 with UNAUTHORIZED errorCode', () => {
    const res = createMockResponse()

    sendUnauthorized(res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'UNAUTHORIZED' })
  })
})

describe('sendForbidden', () => {
  it('sends 403 with FORBIDDEN errorCode', () => {
    const res = createMockResponse()

    sendForbidden(res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'FORBIDDEN' })
  })
})

describe('sendNotFound', () => {
  it('sends 404 with NOT_FOUND errorCode by default', () => {
    const res = createMockResponse()

    sendNotFound(res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'NOT_FOUND' })
  })

  it('uses custom errorCode when provided', () => {
    const res = createMockResponse()

    sendNotFound(res, 'RECORDING_NOT_FOUND')

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'RECORDING_NOT_FOUND' })
  })
})

describe('sendBadRequest', () => {
  it('sends 400 with INVALID_INPUT errorCode by default', () => {
    const res = createMockResponse()

    sendBadRequest(res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_INPUT' })
  })

  it('uses custom errorCode when provided', () => {
    const res = createMockResponse()

    sendBadRequest(res, 'INVALID_UUID')

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INVALID_UUID' })
  })
})

describe('sendInternalError', () => {
  it('sends 500 with INTERNAL_ERROR errorCode', () => {
    const res = createMockResponse()

    sendInternalError(res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ success: false, errorCode: 'INTERNAL_ERROR' })
  })
})
