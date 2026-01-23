import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'

// Schema exported for testing
export const cloudinaryEnvSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
})

export type CloudinaryEnvConfig = z.infer<typeof cloudinaryEnvSchema>

// Stub - will be implemented in ralph-code phase
export function initializeCloudinary(): void {
  // TODO: implement
}

// Stub - will be implemented in ralph-code phase
export function getCloudinaryClient(): typeof cloudinary {
  // TODO: implement
  return cloudinary
}
