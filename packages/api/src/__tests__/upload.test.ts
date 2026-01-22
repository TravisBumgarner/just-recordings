import fs from 'node:fs/promises'
import path from 'node:path'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the database queries module
vi.mock('../db/queries/recordings.js', () => ({
  getAllRecordings: vi.fn(async () => []),
  getRecordingById: vi.fn(async () => null),
  saveRecording: vi.fn(async () => {}),
  deleteRecording: vi.fn(async () => true),
}))

// Mock the supabase lib for auth - using hoisted function refs
vi.mock('../lib/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}))

// Import after mocks are set up
import { app } from '../app.js'
import { saveRecording } from '../db/queries/recordings.js'
import { supabase } from '../lib/supabase.js'

const mockSaveRecording = vi.mocked(saveRecording)
const mockGetUser = vi.mocked(supabase!.auth.getUser)

describe('Upload endpoints', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
    // Reset mock to unauthenticated state by default
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    mockGetUser.mockReset()
    mockSaveRecording.mockClear()
  })

  describe('dev-only middleware', () => {
    it('returns 404 when NODE_ENV is not development', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      const response = await request(app).post('/api/dev/upload/start')
      expect(response.status).toBe(404)
    })

    it('allows requests when NODE_ENV is development', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })
      const response = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      expect(response.status).toBe(200)
    })
  })

  describe('authentication', () => {
    it('returns 401 when no auth header on /start', async () => {
      const response = await request(app).post('/api/dev/upload/start')
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Missing or invalid authorization header')
    })

    it('returns 401 when no auth header on /chunk', async () => {
      const response = await request(app)
        .post('/api/dev/upload/test-upload-id/chunk')
        .field('index', '0')
        .attach('chunk', Buffer.from('test data'), 'chunk-0')
      expect(response.status).toBe(401)
    })

    it('returns 401 when no auth header on /finalize', async () => {
      const response = await request(app)
        .post('/api/dev/upload/test-upload-id/finalize')
        .send({ filename: 'test.webm', mimeType: 'video/webm', totalChunks: 1 })
      expect(response.status).toBe(401)
    })

    it('returns 401 when token is invalid', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid token' } })

      const response = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid or expired token')
    })

    it('allows requests with valid auth token', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })

      const response = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('uploadId')
    })
  })

  describe('POST /api/dev/upload/start', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })
    })

    it('returns 200 status code', async () => {
      const response = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      expect(response.status).toBe(200)
    })

    it('returns an uploadId', async () => {
      const response = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      expect(response.body).toHaveProperty('uploadId')
      expect(typeof response.body.uploadId).toBe('string')
      expect(response.body.uploadId.length).toBeGreaterThan(0)
    })
  })

  describe('POST /api/dev/upload/:uploadId/chunk', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })
    })

    it('returns 200 when receiving a chunk', async () => {
      // First start an upload
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      const { uploadId } = startResponse.body

      const response = await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '0')
        .attach('chunk', Buffer.from('test data'), 'chunk-0')

      expect(response.status).toBe(200)
    })

    it('returns received confirmation with chunk index', async () => {
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      const { uploadId } = startResponse.body

      const response = await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '0')
        .attach('chunk', Buffer.from('test data'), 'chunk-0')

      expect(response.body.received).toBe(true)
      expect(response.body.index).toBe(0)
    })

    it('stores chunk in temp directory', async () => {
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      const { uploadId } = startResponse.body

      await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '0')
        .attach('chunk', Buffer.from('chunk data'), 'chunk-0')

      // Verify chunk file exists
      const chunkPath = path.join('.tmp', uploadId, 'chunk-0')
      const exists = await fs
        .access(chunkPath)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(true)
    })
  })

  describe('POST /api/dev/upload/:uploadId/finalize', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })
    })

    it('returns 200 on successful finalization', async () => {
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      const { uploadId } = startResponse.body

      // Upload a chunk
      await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '0')
        .attach('chunk', Buffer.from('video data'), 'chunk-0')

      const response = await request(app)
        .post(`/api/dev/upload/${uploadId}/finalize`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          filename: 'test-recording.webm',
          mimeType: 'video/webm',
          totalChunks: 1,
        })

      expect(response.status).toBe(200)
    })

    it('returns success with file info', async () => {
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      const { uploadId } = startResponse.body

      await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '0')
        .attach('chunk', Buffer.from('video data'), 'chunk-0')

      const response = await request(app)
        .post(`/api/dev/upload/${uploadId}/finalize`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          filename: 'test-recording.webm',
          mimeType: 'video/webm',
          totalChunks: 1,
        })

      expect(response.body.success).toBe(true)
      expect(response.body.fileId).toBeTruthy()
      expect(response.body.path).toContain('uploads')
      expect(response.body.size).toBeGreaterThan(0)
    })

    it('merges multiple chunks in order', async () => {
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      const { uploadId } = startResponse.body

      // Upload chunks out of order
      await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '1')
        .attach('chunk', Buffer.from('SECOND'), 'chunk-1')

      await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '0')
        .attach('chunk', Buffer.from('FIRST'), 'chunk-0')

      const response = await request(app)
        .post(`/api/dev/upload/${uploadId}/finalize`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          filename: 'test.webm',
          mimeType: 'video/webm',
          totalChunks: 2,
        })

      // Read the merged file and verify order
      const content = await fs.readFile(response.body.path, 'utf-8')
      expect(content).toBe('FIRSTSECOND')
    })

    it('cleans up temp directory after finalization', async () => {
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      const { uploadId } = startResponse.body

      await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '0')
        .attach('chunk', Buffer.from('data'), 'chunk-0')

      await request(app)
        .post(`/api/dev/upload/${uploadId}/finalize`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          filename: 'test.webm',
          mimeType: 'video/webm',
          totalChunks: 1,
        })

      // Verify temp directory is cleaned up
      const tempDir = path.join('.tmp', uploadId)
      const exists = await fs
        .access(tempDir)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(false)
    })

    it('associates recording with authenticated user', async () => {
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      const { uploadId } = startResponse.body

      await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '0')
        .attach('chunk', Buffer.from('video data'), 'chunk-0')

      await request(app)
        .post(`/api/dev/upload/${uploadId}/finalize`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          filename: 'test-recording.webm',
          mimeType: 'video/webm',
          totalChunks: 1,
        })

      // Verify saveRecording was called with userId
      expect(mockSaveRecording).toHaveBeenCalledTimes(1)
      expect(mockSaveRecording).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-recording.webm',
          mimeType: 'video/webm',
        }),
        'test-user-id',
      )
    })
  })
})
