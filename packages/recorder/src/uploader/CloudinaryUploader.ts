import type { TokenGetter, Uploader, UploadMetadata, UploadResult } from './types'

export const CLOUDINARY_CHUNK_SIZE = 6 * 1024 * 1024 // 6MB

export interface CloudinarySignature {
  signature: string
  timestamp: number
  cloudName: string
  apiKey: string
  folder: string
  tags: string[]
  resourceType: string
}

export interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
}

export class CloudinaryUploader implements Uploader {
  private baseUrl: string
  private getToken?: TokenGetter
  private signature?: CloudinarySignature
  private uploadId?: string
  private chunks: Blob[] = []
  private totalSize = 0

  constructor(baseUrl: string, getToken?: TokenGetter) {
    this.baseUrl = baseUrl
    this.getToken = getToken
  }

  private async getAuthHeaders(): Promise<Record<string, string> | undefined> {
    if (!this.getToken) {
      return undefined
    }
    const token = await this.getToken()
    if (!token) {
      return undefined
    }
    return { Authorization: `Bearer ${token}` }
  }

  async requestSignature(): Promise<CloudinarySignature> {
    // Stub - will be implemented
    throw new Error('Not implemented')
  }

  async startUpload(): Promise<string> {
    // Stub - will be implemented
    throw new Error('Not implemented')
  }

  async uploadChunk(_uploadId: string, _chunk: Blob, _index: number): Promise<void> {
    // Stub - will be implemented
    throw new Error('Not implemented')
  }

  async uploadChunkToCloudinary(
    _chunk: Blob,
    _chunkIndex: number,
    _totalChunks: number
  ): Promise<CloudinaryUploadResponse | null> {
    // Stub - will be implemented
    throw new Error('Not implemented')
  }

  async registerRecording(
    _publicId: string,
    _url: string,
    _filename: string,
    _duration: number
  ): Promise<UploadResult> {
    // Stub - will be implemented
    throw new Error('Not implemented')
  }

  async finalizeUpload(_uploadId: string, _metadata: UploadMetadata): Promise<UploadResult> {
    // Stub - will be implemented
    throw new Error('Not implemented')
  }
}
