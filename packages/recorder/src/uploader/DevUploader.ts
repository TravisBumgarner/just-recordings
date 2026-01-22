import {
  finalizeUploadResponseSchema,
  startUploadResponseSchema,
  uploadChunkResponseSchema,
} from '@just-recordings/shared'
import type { TokenGetter, Uploader, UploadMetadata, UploadResult } from './types'

export class DevUploader implements Uploader {
  private baseUrl: string
  private getToken?: TokenGetter

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

  async startUpload(): Promise<string> {
    const authHeaders = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}/dev/upload/start`, {
      method: 'POST',
      ...(authHeaders && { headers: authHeaders }),
    })
    const data = await response.json()
    const parsed = startUploadResponseSchema.parse(data)
    return parsed.uploadId
  }

  async uploadChunk(uploadId: string, chunk: Blob, index: number): Promise<void> {
    const formData = new FormData()
    formData.append('index', String(index))
    formData.append('chunk', chunk)

    const authHeaders = await this.getAuthHeaders()
    const response = await fetch(`${this.baseUrl}/dev/upload/${uploadId}/chunk`, {
      method: 'POST',
      body: formData,
      ...(authHeaders && { headers: authHeaders }),
    })
    const data = await response.json()
    uploadChunkResponseSchema.parse(data)
  }

  async finalizeUpload(uploadId: string, metadata: UploadMetadata): Promise<UploadResult> {
    const authHeaders = await this.getAuthHeaders()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (authHeaders) {
      Object.assign(headers, authHeaders)
    }

    const response = await fetch(`${this.baseUrl}/dev/upload/${uploadId}/finalize`, {
      method: 'POST',
      headers,
      body: JSON.stringify(metadata),
    })
    const data = await response.json()
    return finalizeUploadResponseSchema.parse(data)
  }
}
