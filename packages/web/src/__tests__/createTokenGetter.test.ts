import { describe, expect, it, vi } from 'vitest'

vi.mock('../services/supabase', () => ({
  getToken: vi.fn(),
}))

import { getToken } from '../services/supabase'
import { createTokenGetter } from '../utils/createTokenGetter'

describe('createTokenGetter', () => {
  it('returns the token when getToken succeeds', async () => {
    vi.mocked(getToken).mockResolvedValue({ success: true, token: 'test-auth-token' })

    const tokenGetter = createTokenGetter()
    const token = await tokenGetter()

    expect(token).toBe('test-auth-token')
  })

  it('returns undefined when getToken returns undefined token', async () => {
    vi.mocked(getToken).mockResolvedValue({ success: true, token: undefined })

    const tokenGetter = createTokenGetter()
    const token = await tokenGetter()

    expect(token).toBeUndefined()
  })

  it('returns undefined when getToken fails', async () => {
    vi.mocked(getToken).mockResolvedValue({ success: false, message: 'Get token failed' })

    const tokenGetter = createTokenGetter()
    const token = await tokenGetter()

    expect(token).toBeUndefined()
  })
})
