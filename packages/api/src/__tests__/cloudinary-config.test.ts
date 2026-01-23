import { describe, expect, it } from 'vitest'
import { cloudinaryEnvSchema } from '../config/cloudinary.js'

describe('cloudinary configuration', () => {
  describe('cloudinaryEnvSchema', () => {
    it('validates successfully when all required env vars are provided', () => {
      const validEnv = {
        CLOUDINARY_CLOUD_NAME: 'my-cloud',
        CLOUDINARY_API_KEY: '123456789',
        CLOUDINARY_API_SECRET: 'secret-key',
      }

      const result = cloudinaryEnvSchema.safeParse(validEnv)

      expect(result.success).toBe(true)
    })

    it('fails validation when CLOUDINARY_CLOUD_NAME is missing', () => {
      const invalidEnv = {
        CLOUDINARY_API_KEY: '123456789',
        CLOUDINARY_API_SECRET: 'secret-key',
      }

      const result = cloudinaryEnvSchema.safeParse(invalidEnv)

      expect(result.success).toBe(false)
    })

    it('fails validation when CLOUDINARY_API_KEY is missing', () => {
      const invalidEnv = {
        CLOUDINARY_CLOUD_NAME: 'my-cloud',
        CLOUDINARY_API_SECRET: 'secret-key',
      }

      const result = cloudinaryEnvSchema.safeParse(invalidEnv)

      expect(result.success).toBe(false)
    })

    it('fails validation when CLOUDINARY_API_SECRET is missing', () => {
      const invalidEnv = {
        CLOUDINARY_CLOUD_NAME: 'my-cloud',
        CLOUDINARY_API_KEY: '123456789',
      }

      const result = cloudinaryEnvSchema.safeParse(invalidEnv)

      expect(result.success).toBe(false)
    })

    it('fails validation when CLOUDINARY_CLOUD_NAME is empty string', () => {
      const invalidEnv = {
        CLOUDINARY_CLOUD_NAME: '',
        CLOUDINARY_API_KEY: '123456789',
        CLOUDINARY_API_SECRET: 'secret-key',
      }

      const result = cloudinaryEnvSchema.safeParse(invalidEnv)

      expect(result.success).toBe(false)
    })
  })
})
