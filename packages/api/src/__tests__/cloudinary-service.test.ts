import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock config before importing the service
vi.mock('../config.js', () => ({
  default: {
    nodeEnv: 'development',
    cloudinary: {
      isConfigured: true,
    },
  },
  getCloudinary: vi.fn(),
}))

import config, { getCloudinary } from '../config.js'
import {
  deleteByPublicId,
  deleteByTag,
  getEnvironmentTag,
  getStandardTags,
  uploadImage,
  uploadVideo,
} from '../services/cloudinary.js'

describe('cloudinary service', () => {
  const mockUploader = {
    upload: vi.fn(),
    destroy: vi.fn(),
  }

  const mockApi = {
    delete_resources_by_tag: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(getCloudinary).mockReturnValue({
      uploader: mockUploader,
      api: mockApi,
    } as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getEnvironmentTag', () => {
    it('returns env tag based on NODE_ENV', () => {
      expect(getEnvironmentTag()).toBe('env:development')
    })
  })

  describe('getStandardTags', () => {
    it('includes environment tag and app tag', () => {
      const tags = getStandardTags()

      expect(tags).toContain('env:development')
      expect(tags).toContain('app:just-recordings')
    })
  })

  describe('uploadVideo', () => {
    it('uploads to Cloudinary with video resource type', async () => {
      mockUploader.upload.mockResolvedValue({
        secure_url: 'https://cloudinary.com/video.mp4',
        public_id: 'videos/abc123',
      })

      const result = await uploadVideo('/path/to/video.mp4')

      expect(mockUploader.upload).toHaveBeenCalledWith(
        '/path/to/video.mp4',
        expect.objectContaining({
          resource_type: 'video',
        }),
      )
      expect(result.url).toBe('https://cloudinary.com/video.mp4')
      expect(result.publicId).toBe('videos/abc123')
    })

    it('applies standard tags to uploads', async () => {
      mockUploader.upload.mockResolvedValue({
        secure_url: 'https://cloudinary.com/video.mp4',
        public_id: 'videos/abc123',
      })

      await uploadVideo('/path/to/video.mp4')

      expect(mockUploader.upload).toHaveBeenCalledWith(
        '/path/to/video.mp4',
        expect.objectContaining({
          tags: expect.arrayContaining(['env:development', 'app:just-recordings']),
        }),
      )
    })

    it('uses custom folder when provided', async () => {
      mockUploader.upload.mockResolvedValue({
        secure_url: 'https://cloudinary.com/video.mp4',
        public_id: 'custom-folder/abc123',
      })

      await uploadVideo('/path/to/video.mp4', { folder: 'custom-folder' })

      expect(mockUploader.upload).toHaveBeenCalledWith(
        '/path/to/video.mp4',
        expect.objectContaining({
          folder: 'custom-folder',
        }),
      )
    })
  })

  describe('uploadImage', () => {
    it('uploads to Cloudinary with image resource type', async () => {
      mockUploader.upload.mockResolvedValue({
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: 'thumbnails/abc123',
      })

      const result = await uploadImage('/path/to/image.jpg')

      expect(mockUploader.upload).toHaveBeenCalledWith(
        '/path/to/image.jpg',
        expect.objectContaining({
          resource_type: 'image',
        }),
      )
      expect(result.url).toBe('https://cloudinary.com/image.jpg')
      expect(result.publicId).toBe('thumbnails/abc123')
    })

    it('applies standard tags to uploads', async () => {
      mockUploader.upload.mockResolvedValue({
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: 'thumbnails/abc123',
      })

      await uploadImage('/path/to/image.jpg')

      expect(mockUploader.upload).toHaveBeenCalledWith(
        '/path/to/image.jpg',
        expect.objectContaining({
          tags: expect.arrayContaining(['env:development', 'app:just-recordings']),
        }),
      )
    })
  })

  describe('deleteByPublicId', () => {
    it('calls Cloudinary destroy with the public ID', async () => {
      mockUploader.destroy.mockResolvedValue({ result: 'ok' })

      await deleteByPublicId('videos/abc123')

      expect(mockUploader.destroy).toHaveBeenCalledWith('videos/abc123', expect.any(Object))
    })
  })

  describe('deleteByTag', () => {
    it('calls Cloudinary delete_resources_by_tag', async () => {
      mockApi.delete_resources_by_tag.mockResolvedValue({ deleted: {} })

      await deleteByTag('env:development')

      expect(mockApi.delete_resources_by_tag).toHaveBeenCalledWith('env:development', expect.any(Object))
    })
  })
})
