import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

// Mock the supabase service
vi.mock('../../services/supabase', () => ({
  getUser: vi.fn(),
}))

import { getUser } from '../../services/supabase'
import { loadUserIntoState, useAuthStore } from '../authStore'

const mockGetUser = vi.mocked(getUser)

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state to initial values before each test
    useAuthStore.setState({ authUser: null, loadingUser: true })
    mockGetUser.mockReset()
  })

  describe('useAuthStore', () => {
    it('initializes with null authUser', () => {
      const { result } = renderHook(() => useAuthStore())
      expect(result.current.authUser).toBeNull()
    })

    it('initializes with loadingUser true', () => {
      const { result } = renderHook(() => useAuthStore())
      expect(result.current.loadingUser).toBe(true)
    })

    it('setAuthUser updates authUser state', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = { id: 'user-123', email: 'test@example.com' } as any

      act(() => {
        result.current.setAuthUser(mockUser)
      })

      expect(result.current.authUser).toEqual(mockUser)
    })

    it('setLoadingUser updates loadingUser state', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setLoadingUser(false)
      })

      expect(result.current.loadingUser).toBe(false)
    })

    it('clearAuth resets authUser to null', () => {
      const { result } = renderHook(() => useAuthStore())
      const mockUser = { id: 'user-123', email: 'test@example.com' } as any

      act(() => {
        result.current.setAuthUser(mockUser)
        result.current.clearAuth()
      })

      expect(result.current.authUser).toBeNull()
    })

    it('clearAuth sets loadingUser to false', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.clearAuth()
      })

      expect(result.current.loadingUser).toBe(false)
    })
  })

  describe('loadUserIntoState', () => {
    it('sets authUser when user is found', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockGetUser.mockResolvedValue({ success: true, user: mockUser as any })

      await loadUserIntoState()

      const { result } = renderHook(() => useAuthStore())
      expect(result.current.authUser).toEqual(mockUser)
    })

    it('sets authUser to null when no user is found', async () => {
      mockGetUser.mockResolvedValue({ success: true, user: null })

      await loadUserIntoState()

      const { result } = renderHook(() => useAuthStore())
      expect(result.current.authUser).toBeNull()
    })

    it('sets loadingUser to false after loading', async () => {
      mockGetUser.mockResolvedValue({ success: true, user: null })

      await loadUserIntoState()

      const { result } = renderHook(() => useAuthStore())
      expect(result.current.loadingUser).toBe(false)
    })

    it('sets loadingUser to false even on error', async () => {
      mockGetUser.mockResolvedValue({ success: false, error: 'Failed to get user' })

      await loadUserIntoState()

      const { result } = renderHook(() => useAuthStore())
      expect(result.current.loadingUser).toBe(false)
    })
  })
})
