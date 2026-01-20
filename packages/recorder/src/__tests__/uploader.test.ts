import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createUploader } from '../uploader'
import { chunkBlob } from '../uploader/chunkBlob'
import { DevUploader } from '../uploader/DevUploader'
import { ProdUploader } from '../uploader/ProdUploader'

describe('DevUploader', () => {
  let uploader: DevUploader
  const baseUrl = 'http://localhost:3001/api'

  beforeEach(() => {
    uploader = new DevUploader(baseUrl)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('startUpload', () => {
    it('calls the start endpoint and returns uploadId', async () => {
      const mockUploadId = 'test-upload-id-123'
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ uploadId: mockUploadId }),
      } as Response)

      const uploadId = await uploader.startUpload()

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/dev/upload/start`, {
        method: 'POST',
      })
      expect(uploadId).toBe(mockUploadId)
    })

    it('throws on network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(uploader.startUpload()).rejects.toThrow('Network error')
    })
  })

  describe('uploadChunk', () => {
    it('sends chunk as multipart form data', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ received: true, index: 0 }),
      } as Response)

      const chunk = new Blob(['test data'], { type: 'video/webm' })
      await uploader.uploadChunk('upload-123', chunk, 0)

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/dev/upload/upload-123/chunk`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      )
    })

    it('includes chunk index in form data', async () => {
      let capturedFormData: FormData | undefined
      vi.mocked(fetch).mockImplementationOnce(async (_url, options) => {
        capturedFormData = options?.body as FormData
        return {
          ok: true,
          json: () => Promise.resolve({ received: true, index: 2 }),
        } as Response
      })

      const chunk = new Blob(['test data'])
      await uploader.uploadChunk('upload-123', chunk, 2)

      expect(capturedFormData?.get('index')).toBe('2')
      expect(capturedFormData?.get('chunk')).toBeInstanceOf(Blob)
    })
  })

  describe('finalizeUpload', () => {
    it('sends metadata and returns upload result', async () => {
      const mockResult = {
        success: true,
        fileId: 'file-456',
        path: './uploads/file-456.webm',
        size: 12345,
      }
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      } as Response)

      const result = await uploader.finalizeUpload('upload-123', {
        filename: 'recording.webm',
        mimeType: 'video/webm',
        totalChunks: 5,
      })

      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/dev/upload/upload-123/finalize`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: 'recording.webm',
            mimeType: 'video/webm',
            totalChunks: 5,
          }),
        }),
      )
      expect(result).toEqual(mockResult)
    })
  })
})

describe('ProdUploader', () => {
  let uploader: ProdUploader

  beforeEach(() => {
    uploader = new ProdUploader()
  })

  describe('startUpload', () => {
    it('throws "Not implemented" error', async () => {
      await expect(uploader.startUpload()).rejects.toThrow('Not implemented')
    })
  })

  describe('uploadChunk', () => {
    it('throws "Not implemented" error', async () => {
      const chunk = new Blob(['data'])
      await expect(uploader.uploadChunk('id', chunk, 0)).rejects.toThrow('Not implemented')
    })
  })

  describe('finalizeUpload', () => {
    it('throws "Not implemented" error', async () => {
      await expect(
        uploader.finalizeUpload('id', {
          filename: 'test.webm',
          mimeType: 'video/webm',
          totalChunks: 1,
        }),
      ).rejects.toThrow('Not implemented')
    })
  })
})

describe('createUploader', () => {
  it('returns DevUploader when isDev is true', () => {
    const uploader = createUploader('http://localhost:3001/api', true)
    expect(uploader).toBeInstanceOf(DevUploader)
  })

  it('returns ProdUploader when isDev is false', () => {
    const uploader = createUploader('http://localhost:3001/api', false)
    expect(uploader).toBeInstanceOf(ProdUploader)
  })
})

describe('chunkBlob', () => {
  it('returns empty array for empty blob', () => {
    const blob = new Blob([])
    const chunks = chunkBlob(blob)
    expect(chunks).toEqual([])
  })

  it('returns single chunk for blob smaller than chunk size', () => {
    const data = 'small data'
    const blob = new Blob([data])
    const chunks = chunkBlob(blob, 1024)

    expect(chunks).toHaveLength(1)
    expect(chunks[0].size).toBe(blob.size)
  })

  it('splits blob into multiple chunks', () => {
    const data = 'a'.repeat(100)
    const blob = new Blob([data])
    const chunks = chunkBlob(blob, 30)

    expect(chunks).toHaveLength(4) // 100 / 30 = 3.33 -> 4 chunks
  })

  it('preserves total size across chunks', () => {
    const data = 'test data for chunking'
    const blob = new Blob([data])
    const chunks = chunkBlob(blob, 5)

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    expect(totalSize).toBe(blob.size)
  })
})
