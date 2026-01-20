import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'

describe('GET /api/health', () => {
  it('returns 200 status code', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200)
  })

  it('returns { status: "ok" } in response body', async () => {
    const response = await request(app).get('/api/health')
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('returns JSON content type', async () => {
    const response = await request(app).get('/api/health')
    expect(response.headers['content-type']).toMatch(/application\/json/)
  })
})
