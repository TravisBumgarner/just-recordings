/**
 * Integration tests using real Supabase authentication.
 *
 * These tests require valid credentials in .env.test:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - TEST_USER_EMAIL
 * - TEST_USER_PASSWORD
 *
 * Run with: npm test -- --testPathPattern=integration
 */
import fs from 'node:fs/promises'
import request from 'supertest'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getTestAuthToken, hasIntegrationTestCredentials } from '../helpers/auth.js'

// Skip all tests if credentials are not configured
const describeIf = hasIntegrationTestCredentials() ? describe : describe.skip

describeIf('Authentication integration tests', () => {
  let authToken: string

  beforeAll(async () => {
    if (hasIntegrationTestCredentials()) {
      authToken = await getTestAuthToken()
    }
  })

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
  })

  afterEach(async () => {
    vi.unstubAllEnvs()
    // Clean up test files
    try {
      await fs.rm('.tmp', { recursive: true, force: true })
      await fs.rm('uploads', { recursive: true, force: true })
    } catch {
      // Ignore errors
    }
  })

  describe('Recordings API - unauthenticated requests', () => {
    it('returns 401 when no auth header on GET /recordings', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app).get('/api/recordings')
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Missing or invalid authorization header')
    })

    it('returns 401 when auth header has invalid format', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app)
        .get('/api/recordings')
        .set('Authorization', 'InvalidFormat token')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Missing or invalid authorization header')
    })

    it('returns 401 when token is invalid', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app)
        .get('/api/recordings')
        .set('Authorization', 'Bearer invalid-token-12345')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid or expired token')
    })

    it('returns 401 on all protected recording endpoints without auth', async () => {
      const { app } = await import('../../app.js')

      const endpoints = [
        { method: 'get', path: '/api/recordings' },
        { method: 'get', path: '/api/recordings/some-id' },
        { method: 'get', path: '/api/recordings/some-id/video' },
        { method: 'get', path: '/api/recordings/some-id/thumbnail' },
        { method: 'delete', path: '/api/recordings/some-id' },
      ]

      for (const endpoint of endpoints) {
        const response = await (request(app) as any)[endpoint.method](endpoint.path)
        expect(response.status).toBe(401)
      }
    })
  })

  describe('Recordings API - authenticated requests', () => {
    it('returns 200 with valid auth token on GET /recordings', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app)
        .get('/api/recordings')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('recordings')
      expect(Array.isArray(response.body.recordings)).toBe(true)
    })

    it('returns 404 for non-existent recording with valid auth', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app)
        .get('/api/recordings/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Recording not found')
    })
  })

  describe('Upload API - unauthenticated requests', () => {
    it('returns 401 when no auth header on /start', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app).post('/api/dev/upload/start')
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Missing or invalid authorization header')
    })

    it('returns 401 when no auth header on /chunk', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app)
        .post('/api/dev/upload/test-upload-id/chunk')
        .field('index', '0')
        .attach('chunk', Buffer.from('test data'), 'chunk-0')
      expect(response.status).toBe(401)
    })

    it('returns 401 when no auth header on /finalize', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app)
        .post('/api/dev/upload/test-upload-id/finalize')
        .send({ filename: 'test.webm', mimeType: 'video/webm', totalChunks: 1 })
      expect(response.status).toBe(401)
    })

    it('returns 401 when token is invalid', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer invalid-token-12345')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid or expired token')
    })
  })

  describe('Upload API - authenticated requests', () => {
    it('returns 200 with valid auth token on /start', async () => {
      const { app } = await import('../../app.js')
      const response = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('uploadId')
    })

    it('full upload flow with valid auth token', async () => {
      const { app } = await import('../../app.js')

      // Start upload
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', `Bearer ${authToken}`)

      expect(startResponse.status).toBe(200)
      const { uploadId } = startResponse.body

      // Upload chunk
      const chunkResponse = await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('index', '0')
        .attach('chunk', Buffer.from('test video data'), 'chunk-0')

      expect(chunkResponse.status).toBe(200)
      expect(chunkResponse.body.received).toBe(true)

      // Finalize
      const finalizeResponse = await request(app)
        .post(`/api/dev/upload/${uploadId}/finalize`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          filename: 'integration-test.webm',
          mimeType: 'video/webm',
          totalChunks: 1,
        })

      expect(finalizeResponse.status).toBe(200)
      expect(finalizeResponse.body.success).toBe(true)
      expect(finalizeResponse.body.fileId).toBeTruthy()
    })
  })
})
