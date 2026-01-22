import { z } from 'zod'

const envSchema = z.object({
  VITE_PUBLIC_SUPABASE_URL: z.string().url(),
  VITE_PUBLIC_SUPABASE_ANON_KEY: z.string(),
})

const envVars = {
  VITE_PUBLIC_SUPABASE_URL: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  VITE_PUBLIC_SUPABASE_ANON_KEY: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
}

const parsed = envSchema.safeParse(envVars)
if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsed.error.format(), null, 2)}`,
  )
}

const config = {
  supabaseUrl: parsed.data.VITE_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: parsed.data.VITE_PUBLIC_SUPABASE_ANON_KEY,
}

export default config
