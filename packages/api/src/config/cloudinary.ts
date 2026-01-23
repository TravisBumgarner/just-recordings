import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'

// Schema exported for testing
export const cloudinaryEnvSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
})

export type CloudinaryEnvConfig = z.infer<typeof cloudinaryEnvSchema>

let isInitialized = false

/**
 * Initialize the Cloudinary client with environment variables.
 * Validates that all required env vars are present (fail fast).
 * Should be called once at application startup.
 */
export function initializeCloudinary(): void {
  if (isInitialized) {
    return
  }

  const envVars = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  }

  const parsed = cloudinaryEnvSchema.safeParse(envVars)
  if (!parsed.success) {
    throw new Error(
      `Invalid Cloudinary environment variables: ${JSON.stringify(parsed.error.format(), null, 2)}`
    )
  }

  cloudinary.config({
    cloud_name: parsed.data.CLOUDINARY_CLOUD_NAME,
    api_key: parsed.data.CLOUDINARY_API_KEY,
    api_secret: parsed.data.CLOUDINARY_API_SECRET,
  })

  isInitialized = true
}

/**
 * Get the configured Cloudinary client.
 * Must call initializeCloudinary() first.
 */
export function getCloudinaryClient(): typeof cloudinary {
  if (!isInitialized) {
    throw new Error('Cloudinary not initialized. Call initializeCloudinary() first.')
  }
  return cloudinary
}

/**
 * Check if Cloudinary has been initialized.
 * Useful for conditional initialization in tests.
 */
export function isCloudinaryInitialized(): boolean {
  return isInitialized
}

/**
 * Reset initialization state (for testing purposes only).
 */
export function resetCloudinaryForTesting(): void {
  isInitialized = false
}
