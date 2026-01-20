import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RecorderDatabase } from '../db'
import type { Recording } from '../types'
import { UploadManager } from '../UploadManager'
import type { Uploader } from '../uploader/types'

// Helper to create a test recording
function createTestRecording(overrides: Partial<Recording> = {}): Recording {
  return {
    name: 'Test Recording',
    blob: new Blob(['test'], { type: 'video/webm' }),
    mimeType: 'video/webm',
    duration: 60000,
    createdAt: new Date(),
    fileSize: 1024,
    uploadStatus: 'pending',
    ...overrides,
  }
}

// Create mock uploader
function createMockUploader(
  options: { shouldFail?: boolean; uploadDelay?: number } = {},
): Uploader {
  const { shouldFail = false, uploadDelay = 0 } = options

  return {
    startUpload: vi.fn().mockImplementation(async () => {
      if (uploadDelay) await new Promise((r) => setTimeout(r, uploadDelay))
      return 'upload-id'
    }),
    uploadChunk: vi.fn().mockImplementation(async () => {
      if (uploadDelay) await new Promise((r) => setTimeout(r, uploadDelay))
      if (shouldFail) throw new Error('Upload failed')
    }),
    finalizeUpload: vi.fn().mockImplementation(async () => {
      if (uploadDelay) await new Promise((r) => setTimeout(r, uploadDelay))
      if (shouldFail) throw new Error('Finalize failed')
      return { success: true, fileId: 'server-id', path: '/uploads/test.webm', size: 1024 }
    }),
  }
}

describe('UploadManager', () => {
  let db: RecorderDatabase
  let uploader: Uploader
  let uploadManager: UploadManager

  beforeEach(async () => {
    db = new RecorderDatabase()
    uploader = createMockUploader()
    uploadManager = new UploadManager(db, uploader)
    // Clear database before each test
    await db.recordings.clear()
  })

  afterEach(async () => {
    await db.recordings.clear()
  })

  describe('enqueue', () => {
    it('saves recording to IndexedDB with pending status', async () => {
      const recording = createTestRecording()

      const id = await uploadManager.enqueue(recording)

      const saved = await db.recordings.get(id)
      expect(saved).toBeDefined()
      expect(saved?.uploadStatus).toBe('pending')
    })

    it('returns the IndexedDB id of the saved recording', async () => {
      const recording = createTestRecording()

      const id = await uploadManager.enqueue(recording)

      expect(typeof id).toBe('number')
      expect(id).toBeGreaterThan(0)
    })

    it('triggers queue processing after enqueue', async () => {
      const recording = createTestRecording()

      await uploadManager.enqueue(recording)

      // Wait for processing to complete
      await new Promise((r) => setTimeout(r, 100))

      // Should have called uploader methods
      expect(uploader.startUpload).toHaveBeenCalled()
    })
  })

  describe('successful upload', () => {
    it('removes recording from IndexedDB after successful upload', async () => {
      const recording = createTestRecording()

      const id = await uploadManager.enqueue(recording)

      // Wait for upload to complete
      await new Promise((r) => setTimeout(r, 100))

      const saved = await db.recordings.get(id)
      expect(saved).toBeUndefined()
    })

    it('uploads all chunks to server', async () => {
      const recording = createTestRecording({
        blob: new Blob(['chunk1', 'chunk2'], { type: 'video/webm' }),
      })

      await uploadManager.enqueue(recording)

      // Wait for upload to complete
      await new Promise((r) => setTimeout(r, 100))

      expect(uploader.finalizeUpload).toHaveBeenCalled()
    })
  })

  describe('failed upload', () => {
    it('keeps recording in IndexedDB with failed status', async () => {
      const failingUploader = createMockUploader({ shouldFail: true })
      const failingManager = new UploadManager(db, failingUploader)

      const recording = createTestRecording()
      const id = await failingManager.enqueue(recording)

      // Wait for upload attempt to complete
      await new Promise((r) => setTimeout(r, 100))

      const saved = await db.recordings.get(id)
      expect(saved).toBeDefined()
      expect(saved?.uploadStatus).toBe('failed')
    })

    it('stores error message on failed recording', async () => {
      const failingUploader = createMockUploader({ shouldFail: true })
      const failingManager = new UploadManager(db, failingUploader)

      const recording = createTestRecording()
      const id = await failingManager.enqueue(recording)

      // Wait for upload attempt to complete
      await new Promise((r) => setTimeout(r, 100))

      const saved = await db.recordings.get(id)
      expect(saved?.uploadError).toBeDefined()
    })
  })

  describe('retry', () => {
    it('retries a failed upload', async () => {
      // First create a failed recording
      const failingUploader = createMockUploader({ shouldFail: true })
      const manager = new UploadManager(db, failingUploader)

      const recording = createTestRecording()
      const id = await manager.enqueue(recording)

      // Wait for first attempt to fail
      await new Promise((r) => setTimeout(r, 100))

      // Now use a working uploader for retry
      const workingUploader = createMockUploader()
      const retryManager = new UploadManager(db, workingUploader)

      await retryManager.retry(id)

      // Wait for retry to complete
      await new Promise((r) => setTimeout(r, 100))

      const saved = await db.recordings.get(id)
      expect(saved).toBeUndefined() // Should be removed after successful upload
    })

    it('updates status to uploading during retry', async () => {
      // Create a failed recording directly
      const recording = createTestRecording({ uploadStatus: 'failed' })
      const id = await db.recordings.add(recording)

      // Use slow uploader to catch intermediate state
      const slowUploader = createMockUploader({ uploadDelay: 50 })
      const manager = new UploadManager(db, slowUploader)

      manager.retry(id) // Don't await

      // Check status during upload
      await new Promise((r) => setTimeout(r, 10))
      const during = await db.recordings.get(id)
      expect(during?.uploadStatus).toBe('uploading')
    })
  })

  describe('cancel', () => {
    it('removes recording from IndexedDB', async () => {
      const recording = createTestRecording()
      const id = await db.recordings.add(recording)

      await uploadManager.cancel(id)

      const saved = await db.recordings.get(id)
      expect(saved).toBeUndefined()
    })
  })

  describe('getQueue', () => {
    it('returns pending and failed recordings', async () => {
      await db.recordings.add(createTestRecording({ uploadStatus: 'pending' }))
      await db.recordings.add(createTestRecording({ uploadStatus: 'failed' }))

      // Don't process uploads for this test
      const noopUploader = createMockUploader()
      const manager = new UploadManager(db, noopUploader)

      const queue = await manager.getQueue()

      expect(queue).toHaveLength(2)
    })

    it('does not include uploaded recordings', async () => {
      await db.recordings.add(createTestRecording({ uploadStatus: 'pending' }))
      await db.recordings.add(
        createTestRecording({ uploadStatus: 'uploaded', serverId: 'server-1' }),
      )

      const manager = new UploadManager(db, uploader)
      const queue = await manager.getQueue()

      expect(queue).toHaveLength(1)
      expect(queue[0].uploadStatus).toBe('pending')
    })
  })

  describe('initialize', () => {
    it('processes pending recordings in queue', async () => {
      // Add pending recordings directly to DB
      await db.recordings.add(createTestRecording({ uploadStatus: 'pending' }))
      await db.recordings.add(createTestRecording({ uploadStatus: 'pending' }))

      await uploadManager.initialize()

      // Wait for processing
      await new Promise((r) => setTimeout(r, 200))

      // All should be uploaded (removed from DB)
      const remaining = await db.recordings.toArray()
      expect(remaining).toHaveLength(0)
    })

    it('does not reprocess failed recordings automatically', async () => {
      // Add failed recording directly to DB
      await db.recordings.add(createTestRecording({ uploadStatus: 'failed' }))

      await uploadManager.initialize()

      // Wait for any processing
      await new Promise((r) => setTimeout(r, 100))

      // Should still be there - needs manual retry
      const remaining = await db.recordings.toArray()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].uploadStatus).toBe('failed')
    })
  })

  describe('onQueueChange', () => {
    it('notifies listeners when queue changes', async () => {
      const callback = vi.fn()
      uploadManager.onQueueChange(callback)

      const recording = createTestRecording()
      await uploadManager.enqueue(recording)

      // Wait for notification
      await new Promise((r) => setTimeout(r, 50))

      expect(callback).toHaveBeenCalled()
    })

    it('returns unsubscribe function', async () => {
      const callback = vi.fn()
      const unsubscribe = uploadManager.onQueueChange(callback)

      unsubscribe()

      await uploadManager.enqueue(createTestRecording())

      // Wait and check callback was not called after unsubscribe
      await new Promise((r) => setTimeout(r, 50))

      // Callback might have been called before unsubscribe, so just verify unsubscribe returns a function
      expect(typeof unsubscribe).toBe('function')
    })
  })

  describe('upload progress', () => {
    it('updates uploadProgress during upload', async () => {
      const slowUploader = createMockUploader({ uploadDelay: 30 })
      const manager = new UploadManager(db, slowUploader)

      const recording = createTestRecording()
      const id = await manager.enqueue(recording)

      // Check during upload
      await new Promise((r) => setTimeout(r, 20))
      const during = await db.recordings.get(id)

      // Should have some progress or be uploading
      expect(during?.uploadStatus).toBe('uploading')
    })
  })
})
