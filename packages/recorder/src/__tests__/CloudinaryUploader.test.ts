import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CloudinaryUploader, CLOUDINARY_CHUNK_SIZE } from '../uploader/CloudinaryUploader'
import type { TokenGetter } from '../uploader/types'

describe('CloudinaryUploader', () => {
  const baseUrl = 'http://localhost:3001/api'
  let uploader: CloudinaryUploader

  beforeEach(() => {
    uploader = new CloudinaryUploader(baseUrl)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('CLOUDINARY_CHUNK_SIZE', () => {
    it('is 6MB', () => {
      expect(CLOUDINARY_CHUNK_SIZE).toBe(6 * 1024 * 1024)
    })
  })

  describe('requestSignature', () => {
    it('calls the signature endpoint and returns signature data', async () => {
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      const signature = await uploader.requestSignature()

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/upload/signature`, {
        method: 'POST',
      })
      expect(signature).toEqual(mockSignature)
    })

    it('includes Authorization header when token is provided', async () => {
      const mockGetToken: TokenGetter = vi.fn().mockResolvedValue('auth-token')
      const uploaderWithAuth = new CloudinaryUploader(baseUrl, mockGetToken)

      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      await uploaderWithAuth.requestSignature()

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/upload/signature`, {
        method: 'POST',
        headers: { Authorization: 'Bearer auth-token' },
      })
    })

    it('throws on API error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      } as Response)

      await expect(uploader.requestSignature()).rejects.toThrow()
    })
  })

  describe('startUpload', () => {
    it('requests a signature and returns a unique upload ID', async () => {
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      const uploadId = await uploader.startUpload()

      expect(uploadId).toBeDefined()
      expect(typeof uploadId).toBe('string')
      expect(uploadId.length).toBeGreaterThan(0)
    })
  })

  describe('uploadChunk', () => {
    it('stores chunks for later upload', async () => {
      // First, start an upload to get signature
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      const uploadId = await uploader.startUpload()
      const chunk = new Blob(['test data'], { type: 'video/webm' })

      // uploadChunk should not throw
      await expect(uploader.uploadChunk(uploadId, chunk, 0)).resolves.not.toThrow()
    })
  })

  describe('uploadChunkToCloudinary', () => {
    it('sends chunk to Cloudinary with required headers', async () => {
      // Setup signature first
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      await uploader.startUpload()

      // Mock Cloudinary upload response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            public_id: 'recordings/test-video',
            secure_url: 'https://res.cloudinary.com/test-cloud/video/upload/recordings/test-video.webm',
          }),
      } as Response)

      const chunk = new Blob(['a'.repeat(1000)], { type: 'video/webm' })
      const result = await uploader.uploadChunkToCloudinary(chunk, 0, 1)

      // Verify fetch was called with correct Cloudinary URL
      const fetchCalls = vi.mocked(fetch).mock.calls
      const cloudinaryCall = fetchCalls.find((call) => String(call[0]).includes('cloudinary.com'))

      expect(cloudinaryCall).toBeDefined()
      const [url, options] = cloudinaryCall!
      expect(url).toBe('https://api.cloudinary.com/v1_1/test-cloud/video/upload')
      expect(options?.method).toBe('POST')
    })

    it('includes X-Unique-Upload-Id header', async () => {
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      const uploadId = await uploader.startUpload()

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            public_id: 'recordings/test-video',
            secure_url: 'https://res.cloudinary.com/test-cloud/video/upload/recordings/test-video.webm',
          }),
      } as Response)

      const chunk = new Blob(['a'.repeat(1000)], { type: 'video/webm' })
      await uploader.uploadChunkToCloudinary(chunk, 0, 1)

      const fetchCalls = vi.mocked(fetch).mock.calls
      const cloudinaryCall = fetchCalls.find((call) => String(call[0]).includes('cloudinary.com'))
      const options = cloudinaryCall![1] as RequestInit
      const headers = options.headers as Record<string, string>

      expect(headers['X-Unique-Upload-Id']).toBe(uploadId)
    })

    it('includes Content-Range header for chunked uploads', async () => {
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      await uploader.startUpload()

      // Store first chunk
      const chunk1 = new Blob(['a'.repeat(100)], { type: 'video/webm' })
      await uploader.uploadChunk('test-id', chunk1, 0)

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)

      // Upload first chunk (index 0 of 2 total chunks, size 100 bytes)
      await uploader.uploadChunkToCloudinary(chunk1, 0, 2)

      const fetchCalls = vi.mocked(fetch).mock.calls
      const cloudinaryCall = fetchCalls.find((call) => String(call[0]).includes('cloudinary.com'))
      const options = cloudinaryCall![1] as RequestInit
      const headers = options.headers as Record<string, string>

      // Content-Range format: bytes start-end/total
      expect(headers['Content-Range']).toMatch(/^bytes \d+-\d+\/\d+$/)
    })

    it('returns Cloudinary response on final chunk', async () => {
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      await uploader.startUpload()

      const cloudinaryResponse = {
        public_id: 'recordings/test-video',
        secure_url: 'https://res.cloudinary.com/test-cloud/video/upload/recordings/test-video.webm',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(cloudinaryResponse),
      } as Response)

      const chunk = new Blob(['test data'], { type: 'video/webm' })
      const result = await uploader.uploadChunkToCloudinary(chunk, 0, 1)

      expect(result).toEqual(cloudinaryResponse)
    })
  })

  describe('registerRecording', () => {
    it('calls POST /api/recordings with Cloudinary data', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'recording-123',
            videoUrl: 'https://res.cloudinary.com/test/video/upload/recordings/test.webm',
            thumbnailUrl: 'https://res.cloudinary.com/test/video/upload/c_thumb,w_320,h_180/recordings/test.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
          }),
      } as Response)

      const result = await uploader.registerRecording(
        'recordings/test-video',
        'https://res.cloudinary.com/test/video/upload/recordings/test-video.webm',
        'test.webm',
        120
      )

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/recordings`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cloudinaryPublicId: 'recordings/test-video',
            cloudinaryUrl: 'https://res.cloudinary.com/test/video/upload/recordings/test-video.webm',
            filename: 'test.webm',
            duration: 120,
          }),
        })
      )

      expect(result).toBeDefined()
    })

    it('includes Authorization header when token is provided', async () => {
      const mockGetToken: TokenGetter = vi.fn().mockResolvedValue('auth-token')
      const uploaderWithAuth = new CloudinaryUploader(baseUrl, mockGetToken)

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'recording-123',
            videoUrl: 'https://example.com/video.webm',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
          }),
      } as Response)

      await uploaderWithAuth.registerRecording('test-id', 'https://example.com/video.webm', 'test.webm', 60)

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/recordings`,
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer auth-token' },
        })
      )
    })
  })

  describe('finalizeUpload', () => {
    it('uploads all chunks to Cloudinary and registers the recording', async () => {
      // Setup signature
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      const uploadId = await uploader.startUpload()

      // Store a chunk
      const chunk = new Blob(['test video data'], { type: 'video/webm' })
      await uploader.uploadChunk(uploadId, chunk, 0)

      // Mock Cloudinary upload response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            public_id: 'recordings/test-video',
            secure_url: 'https://res.cloudinary.com/test-cloud/video/upload/recordings/test-video.webm',
          }),
      } as Response)

      // Mock registration response
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'recording-123',
            videoUrl: 'https://res.cloudinary.com/test-cloud/video/upload/recordings/test-video.webm',
            thumbnailUrl:
              'https://res.cloudinary.com/test-cloud/video/upload/c_thumb,w_320,h_180/recordings/test-video.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
          }),
      } as Response)

      const result = await uploader.finalizeUpload(uploadId, {
        filename: 'test.webm',
        mimeType: 'video/webm',
        totalChunks: 1,
        duration: 60,
      })

      expect(result).toBeDefined()
    })

    it('throws if no chunks were uploaded', async () => {
      // Setup signature
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        cloudName: 'test-cloud',
        apiKey: 'test-api-key',
        folder: 'recordings',
        tags: ['env:development'],
        resourceType: 'video',
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSignature),
      } as Response)

      const uploadId = await uploader.startUpload()

      await expect(
        uploader.finalizeUpload(uploadId, {
          filename: 'test.webm',
          mimeType: 'video/webm',
          totalChunks: 0,
        })
      ).rejects.toThrow()
    })
  })
})
