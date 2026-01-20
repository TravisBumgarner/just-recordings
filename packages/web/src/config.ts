import { z } from 'zod'

const envSchema = z.object({
  VITE_PUBLIC_SUPABASE_URL: z.string().url(),
  VITE_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  VITE_PUBLIC_ENVIRONMENT: z.enum(['development', 'production']),
})

const envVars = {
  VITE_PUBLIC_SUPABASE_URL: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  VITE_PUBLIC_SUPABASE_ANON_KEY: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
  VITE_PUBLIC_ENVIRONMENT: import.meta.env.VITE_PUBLIC_ENVIRONMENT,
}

const parsed = envSchema.safeParse(envVars)
if (!parsed.success) {
  // Throw a clear error with details
  throw new Error(
    'Invalid environment variables: ' +
      JSON.stringify(parsed.error.format(), null, 2)
  )
}

const config = {
  supabaseUrl: parsed.data.VITE_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: parsed.data.VITE_PUBLIC_SUPABASE_ANON_KEY,
  isProduction: parsed.data.VITE_PUBLIC_ENVIRONMENT === 'production',
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api',
}

export default config
