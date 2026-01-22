import { config } from 'dotenv'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

let cachedToken: string | null = null
let tokenExpiry: number | null = null
let envLoaded = false

function loadEnv() {
  if (!envLoaded) {
    config({ path: path.resolve(__dirname, '../../../.env.test') })
    envLoaded = true
  }
}

/**
 * Get a valid auth token for the test user.
 * Caches the token to avoid repeated sign-ins during test runs.
 */
export async function getTestAuthToken(): Promise<string> {
  loadEnv()

  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.test for integration tests',
    )
  }

  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.test for integration tests')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    throw new Error(`Failed to sign in test user: ${error?.message ?? 'No session returned'}`)
  }

  cachedToken = data.session.access_token
  // Token expires_at is in seconds, convert to milliseconds
  tokenExpiry = data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 3600 * 1000

  return cachedToken
}

/**
 * Get the test user's ID after authentication.
 */
export async function getTestUserId(): Promise<string> {
  loadEnv()

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email = process.env.TEST_USER_EMAIL
  const password = process.env.TEST_USER_PASSWORD

  if (!supabaseUrl || !supabaseKey || !email || !password) {
    throw new Error('Test environment variables not configured')
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    throw new Error(`Failed to get test user: ${error?.message ?? 'No user returned'}`)
  }

  return data.user.id
}

/**
 * Check if integration test credentials are configured.
 */
export function hasIntegrationTestCredentials(): boolean {
  loadEnv()
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.TEST_USER_EMAIL &&
      process.env.TEST_USER_PASSWORD,
  )
}

/**
 * Clear the cached token (useful for testing token expiry scenarios).
 */
export function clearCachedToken(): void {
  cachedToken = null
  tokenExpiry = null
}
