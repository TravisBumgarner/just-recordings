import fs from 'node:fs/promises'
import path from 'node:path'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const UPLOADS_DIR = 'uploads'

// Mock the supabase lib for auth
vi.mock('../lib/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}))

// Mock the user database queries module
// Note: The mock returns id: 'test-user-id' to match the userId used in test recordings
vi.mock('../db/queries/users.js', () => ({
  getUserByAuthId: vi.fn(async () => ({ id: 'test-user-id', authId: 'auth-id', email: 'test@example.com' })),
  getOrCreateUserByAuth: vi.fn(async () => ({ id: 'test-user-id', authId: 'auth-id', email: 'test@example.com' })),
}))

// Mock the database queries module
vi.mock('../db/queries/recordings.js', () => {
  const mockRecordings: Map<string, any> = new Map()

  return {
    getAllRecordings: vi.fn(async (userId?: string) => {
      let recordings = Array.from(mockRecordings.values())
      if (userId) {
        recordings = recordings.filter((r) => r.userId === userId)
      }
      return recordings.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }),
    getRecordingById: vi.fn(async (id: string, userId?: string) => {
      const recording = mockRecordings.get(id)
      if (!recording) return null
      if (userId && recording.userId !== userId) return null
      return recording
    }),
    saveRecording: vi.fn(async (recording: any, userId?: string) => {
      mockRecordings.set(recording.id, { ...recording, userId: userId ?? null })
    }),
    deleteRecording: vi.fn(async (id: string) => {
      const existed = mockRecordings.has(id)
      mockRecordings.delete(id)
      return existed
    }),
    // Export for test manipulation
    _mockRecordings: mockRecordings,
    _resetMock: () => {
      mockRecordings.clear()
    },
  }
})

import { app } from '../app.js'
import * as recordingsRepo from '../db/queries/recordings.js'
import { supabase } from '../lib/supabase.js'

const mockRepo = recordingsRepo as any
// biome-ignore lint/style/noNonNullAssertion: supabase is always mocked in tests
const mockGetUser = vi.mocked(supabase!.auth.getUser)

// Helper to create a test recording
async function createTestRecording(
  id: string,
  metadata: {
    name: string
    mimeType: string
    duration: number
    fileSize: number
    createdAt: string
    thumbnailPath?: string
    userId?: string
  },
) {
  await fs.mkdir(UPLOADS_DIR, { recursive: true })

  // Write video file
  const videoPath = path.join(UPLOADS_DIR, `${id}.webm`)
  await fs.writeFile(videoPath, Buffer.from('fake video content'))

  const recording = {
    id,
    path: videoPath,
    ...metadata,
  }

  // Add to mock repository
  mockRepo._mockRecordings.set(id, recording)

  return recording
}

// Helper to clean up test files
async function cleanupTestFiles() {
  try {
    await fs.rm(UPLOADS_DIR, { recursive: true, force: true })
  } catch {
    // Ignore errors
  }
  mockRepo._resetMock()
}

describe('Recordings endpoints', () => {
  beforeEach(async () => {
    await cleanupTestFiles()
    // Default to authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    } as any)
  })

  afterEach(async () => {
    await cleanupTestFiles()
    mockGetUser.mockReset()
  })

  describe('authentication', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: null } as any)
    })

    it('returns 401 when no auth header on GET /recordings', async () => {
      const response = await request(app).get('/api/recordings')
      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Missing or invalid authorization header')
    })

    it('returns 401 when no auth header on GET /recordings/:id', async () => {
      const response = await request(app).get('/api/recordings/some-id')
      expect(response.status).toBe(401)
    })

    it('returns 401 when no auth header on GET /recordings/:id/video', async () => {
      const response = await request(app).get('/api/recordings/some-id/video')
      expect(response.status).toBe(401)
    })

    it('returns 401 when no auth header on GET /recordings/:id/thumbnail', async () => {
      const response = await request(app).get('/api/recordings/some-id/thumbnail')
      expect(response.status).toBe(401)
    })

    it('returns 401 when no auth header on DELETE /recordings/:id', async () => {
      const response = await request(app).delete('/api/recordings/some-id')
      expect(response.status).toBe(401)
    })

    it('returns 401 when token is invalid', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid token' } } as any)

      const response = await request(app)
        .get('/api/recordings')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Invalid or expired token')
    })
  })

  describe('GET /api/recordings', () => {
    it('returns empty array when no recordings exist', async () => {
      const response = await request(app)
        .get('/api/recordings')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.recordings).toEqual([])
    })

    it('returns list of recordings with metadata', async () => {
      await createTestRecording('test-id-1', {
        name: 'Recording 1',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'test-user-id',
      })

      const response = await request(app)
        .get('/api/recordings')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.recordings).toHaveLength(1)
      expect(response.body.data.recordings[0]).toMatchObject({
        id: 'test-id-1',
        name: 'Recording 1',
        duration: 60000,
        fileSize: 1024,
      })
    })

    it('returns only recordings owned by authenticated user', async () => {
      await createTestRecording('my-recording', {
        name: 'My Recording',
        mimeType: 'video/webm',
        duration: 30000,
        fileSize: 512,
        createdAt: '2026-01-18T10:00:00Z',
        userId: 'test-user-id',
      })
      await createTestRecording('other-recording', {
        name: 'Other Recording',
        mimeType: 'video/webm',
        duration: 45000,
        fileSize: 768,
        createdAt: '2026-01-18T11:00:00Z',
        userId: 'other-user-id',
      })

      const response = await request(app)
        .get('/api/recordings')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.recordings).toHaveLength(1)
      expect(response.body.data.recordings[0].id).toBe('my-recording')
    })
  })

  describe('GET /api/recordings/:id', () => {
    it('returns 400 INVALID_UUID when id is not a valid UUID', async () => {
      const response = await request(app)
        .get('/api/recordings/not-a-uuid')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ success: false, errorCode: 'INVALID_UUID' })
    })

    it('returns 404 RECORDING_NOT_FOUND when recording does not exist', async () => {
      const response = await request(app)
        .get('/api/recordings/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(404)
      expect(response.body).toEqual({ success: false, errorCode: 'RECORDING_NOT_FOUND' })
    })

    it('returns recording metadata for owned recording', async () => {
      await createTestRecording('550e8400-e29b-41d4-a716-446655440001', {
        name: 'Test Recording',
        mimeType: 'video/webm',
        duration: 90000,
        fileSize: 2048,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'test-user-id',
      })

      const response = await request(app)
        .get('/api/recordings/550e8400-e29b-41d4-a716-446655440001')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Recording',
        mimeType: 'video/webm',
        duration: 90000,
        fileSize: 2048,
      })
    })

    it('returns 403 FORBIDDEN for recording not owned by user', async () => {
      await createTestRecording('550e8400-e29b-41d4-a716-446655440002', {
        name: 'Other User Recording',
        mimeType: 'video/webm',
        duration: 90000,
        fileSize: 2048,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'other-user-id',
      })

      const response = await request(app)
        .get('/api/recordings/550e8400-e29b-41d4-a716-446655440002')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(403)
      expect(response.body).toEqual({ success: false, errorCode: 'FORBIDDEN' })
    })
  })

  describe('GET /api/recordings/:id/video', () => {
    it('returns 400 INVALID_UUID when id is not a valid UUID', async () => {
      const response = await request(app)
        .get('/api/recordings/not-a-uuid/video')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ success: false, errorCode: 'INVALID_UUID' })
    })

    it('returns 404 RECORDING_NOT_FOUND when recording does not exist', async () => {
      const response = await request(app)
        .get('/api/recordings/550e8400-e29b-41d4-a716-446655440010/video')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(404)
      expect(response.body).toEqual({ success: false, errorCode: 'RECORDING_NOT_FOUND' })
    })

    it('serves video file with correct content type', async () => {
      await createTestRecording('550e8400-e29b-41d4-a716-446655440011', {
        name: 'Video Test',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'test-user-id',
      })

      const response = await request(app)
        .get('/api/recordings/550e8400-e29b-41d4-a716-446655440011/video')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('video/webm')
    })

    it('returns video file content', async () => {
      await createTestRecording('550e8400-e29b-41d4-a716-446655440012', {
        name: 'Video Content',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'test-user-id',
      })

      const response = await request(app)
        .get('/api/recordings/550e8400-e29b-41d4-a716-446655440012/video')
        .set('Authorization', 'Bearer valid-token')
        .buffer()

      expect(response.body.toString()).toBe('fake video content')
    })

    it('returns 403 FORBIDDEN for video of recording not owned by user', async () => {
      await createTestRecording('550e8400-e29b-41d4-a716-446655440013', {
        name: 'Other Video',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'other-user-id',
      })

      const response = await request(app)
        .get('/api/recordings/550e8400-e29b-41d4-a716-446655440013/video')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(403)
      expect(response.body).toEqual({ success: false, errorCode: 'FORBIDDEN' })
    })
  })

  describe('DELETE /api/recordings/:id', () => {
    it('returns 404 when recording does not exist', async () => {
      const response = await request(app)
        .delete('/api/recordings/nonexistent')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(404)
    })

    it('deletes recording and returns success', async () => {
      await createTestRecording('to-delete', {
        name: 'To Delete',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'test-user-id',
      })

      const response = await request(app)
        .delete('/api/recordings/to-delete')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('removes video file from disk', async () => {
      const recording = await createTestRecording('delete-file', {
        name: 'Delete File',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'test-user-id',
      })

      await request(app)
        .delete('/api/recordings/delete-file')
        .set('Authorization', 'Bearer valid-token')

      const exists = await fs
        .access(recording.path)
        .then(() => true)
        .catch(() => false)
      expect(exists).toBe(false)
    })

    it('removes recording from database', async () => {
      await createTestRecording('remove-meta', {
        name: 'Remove Meta',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'test-user-id',
      })

      await request(app)
        .delete('/api/recordings/remove-meta')
        .set('Authorization', 'Bearer valid-token')

      // Verify recording is no longer in list
      const listResponse = await request(app)
        .get('/api/recordings')
        .set('Authorization', 'Bearer valid-token')
      expect(listResponse.body.data.recordings).toHaveLength(0)
    })

    it('returns 404 for recording not owned by user', async () => {
      await createTestRecording('other-delete', {
        name: 'Other Delete',
        mimeType: 'video/webm',
        duration: 60000,
        fileSize: 1024,
        createdAt: '2026-01-18T12:00:00Z',
        userId: 'other-user-id',
      })

      const response = await request(app)
        .delete('/api/recordings/other-delete')
        .set('Authorization', 'Bearer valid-token')

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('Recording not found')
    })
  })

  describe('Upload finalize saves metadata', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development')
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      } as any)
    })

    afterEach(() => {
      vi.unstubAllEnvs()
      mockGetUser.mockReset()
    })

    it('saves recording metadata when upload finalizes', async () => {
      // Start upload
      const startResponse = await request(app)
        .post('/api/dev/upload/start')
        .set('Authorization', 'Bearer valid-token')
      const { uploadId } = startResponse.body

      // Upload chunk
      await request(app)
        .post(`/api/dev/upload/${uploadId}/chunk`)
        .set('Authorization', 'Bearer valid-token')
        .field('index', '0')
        .attach('chunk', Buffer.from('video data'), 'chunk-0')

      // Finalize with metadata
      const finalizeResponse = await request(app)
        .post(`/api/dev/upload/${uploadId}/finalize`)
        .set('Authorization', 'Bearer valid-token')
        .send({
          filename: 'My Recording',
          mimeType: 'video/webm',
          totalChunks: 1,
          duration: 45000,
        })

      // Verify recording appears in list
      const listResponse = await request(app)
        .get('/api/recordings')
        .set('Authorization', 'Bearer valid-token')

      expect(listResponse.body.data.recordings).toHaveLength(1)
      expect(listResponse.body.data.recordings[0]).toMatchObject({
        id: finalizeResponse.body.fileId,
        name: 'My Recording',
        mimeType: 'video/webm',
      })
    })
  })
})
