import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUser,
  login,
  signup,
  logout,
  getToken,
  resetPassword,
  updatePassword,
} from '../../auth/service'
import type { AuthClient } from '../../auth/client'

// Create a mock Supabase client
function createMockClient(overrides: {
  getSession?: () => Promise<{ data: { session: { access_token: string } | null }; error: null | { message: string } }>
  getUser?: () => Promise<{ data: { user: { id: string; email: string } | null }; error: null | { message: string } }>
  signInWithPassword?: () => Promise<{ data: unknown; error: null | { message: string } }>
  signUp?: () => Promise<{ data: unknown; error: null | { message: string } }>
  signOut?: () => Promise<{ error: null | { message: string } }>
  resetPasswordForEmail?: () => Promise<{ error: null | { message: string } }>
  updateUser?: () => Promise<{ error: null | { message: string } }>
} = {}): AuthClient {
  return {
    auth: {
      getSession: overrides.getSession ?? vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: overrides.getUser ?? vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: overrides.signInWithPassword ?? vi.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: overrides.signUp ?? vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: overrides.signOut ?? vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: overrides.resetPasswordForEmail ?? vi.fn().mockResolvedValue({ error: null }),
      updateUser: overrides.updateUser ?? vi.fn().mockResolvedValue({ error: null }),
    },
  } as unknown as AuthClient
}

describe('getUser', () => {
  it('returns null user when no session exists', async () => {
    const mockClient = createMockClient({
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    })
    const result = await getUser(mockClient)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.user).toBeNull()
    }
  })

  it('returns user when session exists', async () => {
    const mockClient = createMockClient({
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'token' } }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123', email: 'test@example.com' } }, error: null }),
    })
    const result = await getUser(mockClient)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.user).toEqual({ id: '123', email: 'test@example.com' })
    }
  })

  it('returns error when getUser fails', async () => {
    const mockClient = createMockClient({
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'token' } }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { message: 'Auth error' } }),
    })
    const result = await getUser(mockClient)
    expect(result.success).toBe(false)
  })
})

describe('login', () => {
  it('returns success on successful login', async () => {
    const mockClient = createMockClient({
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
    })
    const result = await login(mockClient, { email: 'test@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('returns error on failed login', async () => {
    const mockClient = createMockClient({
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: { message: 'Invalid credentials' } }),
    })
    const result = await login(mockClient, { email: 'test@example.com', password: 'wrong' })
    expect(result.success).toBe(false)
  })
})

describe('signup', () => {
  it('returns success on successful signup', async () => {
    const mockClient = createMockClient({
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })
    const result = await signup(mockClient, { email: 'new@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('returns error on failed signup', async () => {
    const mockClient = createMockClient({
      signUp: vi.fn().mockResolvedValue({ data: null, error: { message: 'Email already exists' } }),
    })
    const result = await signup(mockClient, { email: 'existing@example.com', password: 'password123' })
    expect(result.success).toBe(false)
  })
})

describe('logout', () => {
  it('returns success on logout', async () => {
    const mockClient = createMockClient({
      signOut: vi.fn().mockResolvedValue({ error: null }),
    })
    const result = await logout(mockClient)
    expect(result.success).toBe(true)
  })
})

describe('getToken', () => {
  it('returns token when session exists', async () => {
    const mockClient = createMockClient({
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'my-token' } }, error: null }),
    })
    const result = await getToken(mockClient)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.token).toBe('my-token')
    }
  })

  it('returns undefined token when no session exists', async () => {
    const mockClient = createMockClient({
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    })
    const result = await getToken(mockClient)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.token).toBeUndefined()
    }
  })
})

describe('resetPassword', () => {
  it('returns success when reset email sent', async () => {
    const mockClient = createMockClient({
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    })
    const result = await resetPassword(mockClient, 'test@example.com', 'https://app.com/reset')
    expect(result.success).toBe(true)
  })

  it('returns error when reset fails', async () => {
    const mockClient = createMockClient({
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: { message: 'User not found' } }),
    })
    const result = await resetPassword(mockClient, 'unknown@example.com', 'https://app.com/reset')
    expect(result.success).toBe(false)
  })
})

describe('updatePassword', () => {
  it('returns success when password updated', async () => {
    const mockClient = createMockClient({
      updateUser: vi.fn().mockResolvedValue({ error: null }),
    })
    const result = await updatePassword(mockClient, 'newpassword123')
    expect(result.success).toBe(true)
  })

  it('returns error when update fails', async () => {
    const mockClient = createMockClient({
      updateUser: vi.fn().mockResolvedValue({ error: { message: 'Invalid password' } }),
    })
    const result = await updatePassword(mockClient, 'weak')
    expect(result.success).toBe(false)
  })
})
