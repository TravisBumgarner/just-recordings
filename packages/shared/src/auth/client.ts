import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type AuthClient = SupabaseClient

export function createAuthClient(_url: string, _anonKey: string): AuthClient {
  // Stub - returns a mock client for now
  return {} as AuthClient
}
