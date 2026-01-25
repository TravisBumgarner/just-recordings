import { v2 as cloudinary } from 'cloudinary'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/just_recordings'),
  SUPABASE_URL: z.string().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(''),
  CLOUDINARY_URL: z.string().default(''),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
})

const envVars = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
}

const parsed = envSchema.safeParse(envVars)
if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsed.error.format(), null, 2)}`,
  )
}

// Parse CLOUDINARY_URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
function parseCloudinaryUrl(url: string): { cloudName: string; apiKey: string; apiSecret: string } | null {
  if (!url) return null
  const match = url.match(/^cloudinary:\/\/(\d+):([^@]+)@(.+)$/)
  if (!match) return null
  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] }
}

const cloudinaryCredentials = parseCloudinaryUrl(parsed.data.CLOUDINARY_URL)
const cloudinaryConfigured = cloudinaryCredentials !== null

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudinaryCredentials.cloudName,
    api_key: cloudinaryCredentials.apiKey,
    api_secret: cloudinaryCredentials.apiSecret,
  })
}

const config = {
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  supabaseUrl: parsed.data.SUPABASE_URL,
  supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
  isProduction: parsed.data.NODE_ENV === 'production',
  isDevelopment: parsed.data.NODE_ENV === 'development',
  frontendUrl: parsed.data.FRONTEND_URL,
  cloudinary: {
    cloudName: cloudinaryCredentials?.cloudName ?? '',
    apiKey: cloudinaryCredentials?.apiKey ?? '',
    isConfigured: cloudinaryConfigured,
  },
}

/**
 * Get the Cloudinary client. Throws if Cloudinary is not configured.
 */
export function getCloudinary(): typeof cloudinary {
  if (!cloudinaryConfigured) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_URL environment variable (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME).',
    )
  }
  return cloudinary
}

export default config
