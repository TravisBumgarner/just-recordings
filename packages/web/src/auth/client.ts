import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type AuthClient = SupabaseClient

export function createAuthClient(url: string, anonKey: string): AuthClient {
  return createClient(url, anonKey)
}
