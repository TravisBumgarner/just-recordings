export type UploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed'

export interface Recording {
  id?: number
  name: string
  blob: Blob
  mimeType: string
  duration: number
  createdAt: Date
  fileSize: number
  // Upload queue fields
  uploadStatus: UploadStatus
  uploadProgress?: number
  uploadError?: string
  serverId?: string
}

export type RecorderState = 'idle' | 'recording' | 'paused'

export interface RecordingOptions {
  mimeType?: string
  videoBitsPerSecond?: number
  audioBitsPerSecond?: number
}
