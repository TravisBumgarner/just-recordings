import type { RecorderDatabase } from './db'
import type { Recording } from './types'
import { chunkBlob } from './uploader/chunkBlob'
import type { Uploader } from './uploader/types'

export type QueueChangeCallback = (queue: Recording[]) => void

export class UploadManager {
  private db: RecorderDatabase
  private uploader: Uploader
  private listeners: Set<QueueChangeCallback> = new Set()
  private processing: boolean = false

  constructor(db: RecorderDatabase, uploader: Uploader) {
    this.db = db
    this.uploader = uploader
  }

  // Start processing queue on app load
  async initialize(): Promise<void> {
    await this.processQueue()
  }

  // Add recording to queue (called after stopRecording)
  async enqueue(recording: Recording): Promise<number> {
    // Ensure status is pending
    const recordingToSave: Recording = {
      ...recording,
      uploadStatus: 'pending',
      uploadProgress: 0,
    }

    const id = await this.db.recordings.add(recordingToSave)
    await this.notifyListeners()

    // Start processing in background (don't await)
    this.processQueue()

    return id
  }

  // Retry a failed upload
  async retry(id: number): Promise<void> {
    const recording = await this.db.recordings.get(id)
    if (!recording || recording.uploadStatus !== 'failed') {
      return
    }

    // Update status to pending for retry
    await this.db.recordings.update(id, {
      uploadStatus: 'pending',
      uploadError: undefined,
      uploadProgress: 0,
    })

    await this.notifyListeners()

    // Start processing
    this.processQueue()
  }

  // Cancel/remove from queue
  async cancel(id: number): Promise<void> {
    await this.db.recordings.delete(id)
    await this.notifyListeners()
  }

  // Get current queue (pending and failed)
  async getQueue(): Promise<Recording[]> {
    const allRecordings = await this.db.recordings.toArray()
    return allRecordings.filter(
      (r) =>
        r.uploadStatus === 'pending' ||
        r.uploadStatus === 'failed' ||
        r.uploadStatus === 'uploading',
    )
  }

  // Subscribe to queue changes
  onQueueChange(callback: QueueChangeCallback): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Notify listeners of queue changes
  protected async notifyListeners(): Promise<void> {
    const queue = await this.getQueue()
    this.listeners.forEach((callback) => {
      try {
        callback(queue)
      } catch {
        // Ignore listener errors
      }
    })
  }

  // Process pending uploads in the queue
  private async processQueue(): Promise<void> {
    if (this.processing) {
      return // Already processing
    }

    this.processing = true

    try {
      while (true) {
        // Find next pending recording
        const allRecordings = await this.db.recordings.toArray()
        const pending = allRecordings.find((r) => r.uploadStatus === 'pending')

        if (!pending || !pending.id) {
          break // No more pending recordings
        }

        await this.uploadRecording(pending.id)
      }
    } finally {
      this.processing = false
    }
  }

  // Upload a single recording
  private async uploadRecording(id: number): Promise<void> {
    const recording = await this.db.recordings.get(id)
    if (!recording) {
      return
    }

    try {
      // Update status to uploading
      await this.db.recordings.update(id, {
        uploadStatus: 'uploading',
        uploadProgress: 0,
      })
      await this.notifyListeners()

      // Start upload
      const uploadId = await this.uploader.startUpload()

      // Chunk the blob
      const chunks = chunkBlob(recording.blob)
      const totalChunks = chunks.length

      // Upload each chunk
      for (let i = 0; i < chunks.length; i++) {
        await this.uploader.uploadChunk(uploadId, chunks[i], i)

        // Update progress
        const progress = ((i + 1) / totalChunks) * 100
        await this.db.recordings.update(id, {
          uploadProgress: progress,
        })
        await this.notifyListeners()
      }

      // Finalize upload
      const _result = await this.uploader.finalizeUpload(uploadId, {
        filename: recording.name,
        mimeType: recording.mimeType,
        totalChunks,
      })

      // Success - remove from IndexedDB
      await this.db.recordings.delete(id)
      await this.notifyListeners()
    } catch (error) {
      // Failed - update status
      await this.db.recordings.update(id, {
        uploadStatus: 'failed',
        uploadError: error instanceof Error ? error.message : 'Upload failed',
      })
      await this.notifyListeners()
    }
  }
}
