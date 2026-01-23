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

  private generateUploadId(): string {
    // Generate a unique upload ID for Cloudinary chunked uploads
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  async requestSignature(): Promise<CloudinarySignature> {
    const authHeaders = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}/upload/signature`, {
      method: 'POST',
      ...(authHeaders && { headers: authHeaders }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Failed to get signature: ${response.status}`)
    }

    const data = await response.json()
    return data as CloudinarySignature
  }

  async startUpload(): Promise<string> {
    // Request a signature from the API
    this.signature = await this.requestSignature()

    // Generate a unique upload ID for this upload session
    this.uploadId = this.generateUploadId()

    // Reset chunks array
    this.chunks = []
    this.totalSize = 0

    return this.uploadId
  }

  async uploadChunk(_uploadId: string, chunk: Blob, _index: number): Promise<void> {
    // Store chunks for later upload to Cloudinary
    // We batch chunks because Cloudinary requires Content-Range headers
    // which need to know the total size
    this.chunks.push(chunk)
    this.totalSize += chunk.size
  }

  async uploadChunkToCloudinary(
    chunk: Blob,
    chunkIndex: number,
    _totalChunks: number
  ): Promise<CloudinaryUploadResponse | null> {
    if (!this.signature || !this.uploadId) {
      throw new Error('Upload not started. Call startUpload() first.')
    }

    const { signature, timestamp, cloudName, apiKey, folder, tags } = this.signature

    // Calculate byte range for Content-Range header
    let startByte = 0
    for (let i = 0; i < chunkIndex; i++) {
      startByte += this.chunks[i]?.size || 0
    }
    const endByte = startByte + chunk.size - 1

    // Build form data for Cloudinary upload
    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)
    formData.append('folder', folder)
    formData.append('tags', tags.join(','))

    // Headers for chunked upload
    const headers: Record<string, string> = {
      'X-Unique-Upload-Id': this.uploadId,
      'Content-Range': `bytes ${startByte}-${endByte}/${this.totalSize}`,
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`

    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error?.message || `Failed to upload chunk: ${response.status}`)
    }

    const data = await response.json()

    // Cloudinary returns the full response only on the final chunk
    if (data.public_id && data.secure_url) {
      return data as CloudinaryUploadResponse
    }

    return null
  }

  async registerRecording(
    publicId: string,
    url: string,
    filename: string,
    duration: number
  ): Promise<UploadResult> {
    const authHeaders = await this.getAuthHeaders()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authHeaders) {
      Object.assign(headers, authHeaders)
    }

    const response = await fetch(`${this.baseUrl}/recordings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        cloudinaryPublicId: publicId,
        cloudinaryUrl: url,
        filename,
        duration,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Failed to register recording: ${response.status}`)
    }

    const data = await response.json()

    // Map the API response to UploadResult format
    return {
      success: true,
      fileId: data.id,
      path: data.videoUrl,
      size: 0, // Size not provided by registration endpoint
    }
  }

  async finalizeUpload(_uploadId: string, metadata: UploadMetadata): Promise<UploadResult> {
    if (this.chunks.length === 0) {
      throw new Error('No chunks to upload')
    }

    // Upload all chunks to Cloudinary
    let cloudinaryResponse: CloudinaryUploadResponse | null = null
    const totalChunks = this.chunks.length

    for (let i = 0; i < totalChunks; i++) {
      const chunk = this.chunks[i]
      const result = await this.uploadChunkToCloudinary(chunk, i, totalChunks)

      // The final chunk returns the complete response
      if (result) {
        cloudinaryResponse = result
      }
    }

    if (!cloudinaryResponse) {
      throw new Error('Failed to get Cloudinary response after uploading all chunks')
    }

    // Register the recording with the API
    const result = await this.registerRecording(
      cloudinaryResponse.public_id,
      cloudinaryResponse.secure_url,
      metadata.filename,
      metadata.duration || 0
    )

    // Clear chunks after successful upload
    this.chunks = []
    this.totalSize = 0

    return result
  }
}
