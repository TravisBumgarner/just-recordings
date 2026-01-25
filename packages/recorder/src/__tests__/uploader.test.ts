import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createUploader } from '../uploader'
import { chunkBlob } from '../uploader/chunkBlob'
import { CloudinaryUploader } from '../uploader/CloudinaryUploader'
import type { TokenGetter } from '../uploader/types'

describe('createUploader', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns CloudinaryUploader', () => {
    const uploader = createUploader('http://localhost:3001/api')
    expect(uploader).toBeInstanceOf(CloudinaryUploader)
  })

  it('accepts optional getToken parameter', () => {
    const mockGetToken: TokenGetter = async () => 'test-token'
    const uploader = createUploader('http://localhost:3001/api', mockGetToken)
    expect(uploader).toBeInstanceOf(CloudinaryUploader)
  })
})

describe('chunkBlob', () => {
  it('returns empty array for empty blob', () => {
    const blob = new Blob([])
    const chunks = chunkBlob(blob)
    expect(chunks).toEqual([])
  })

  it('uses default chunk size of at least 5MB for Cloudinary compatibility', () => {
    // Cloudinary requires all parts except EOF-chunk to be >= 5MB
    // Create a blob that's 12MB to ensure we test the default chunking
    const data = 'a'.repeat(12 * 1024 * 1024) // 12MB
    const blob = new Blob([data])
    const chunks = chunkBlob(blob) // Uses default chunk size

    // With 12MB and 6MB default chunks, we should get 2 chunks
    expect(chunks.length).toBe(2)
    // First chunk should be at least 5MB (Cloudinary minimum)
    expect(chunks[0].size).toBeGreaterThanOrEqual(5 * 1024 * 1024)
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
