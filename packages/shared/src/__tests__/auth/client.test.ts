import { describe, expect, it } from 'vitest'
import { createAuthClient } from '../../../../web/src/auth/client'

describe('createAuthClient', () => {
  it('creates a Supabase client with provided URL and key', () => {
    const client = createAuthClient('https://test.supabase.co', 'test-anon-key')
    expect(client).toBeDefined()
    expect(client.auth).toBeDefined()
  })
})
