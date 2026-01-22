import { create } from 'zustand'
import type { User } from '@just-recordings/shared/auth'
import { getUser } from '../services/supabase'

export interface AuthState {
  authUser: User | null
  loadingUser: boolean
  setAuthUser: (user: User | null) => void
  setLoadingUser: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  loadingUser: true,
  setAuthUser: (user) => set({ authUser: user }),
  setLoadingUser: (loading) => set({ loadingUser: loading }),
  clearAuth: () => set({ authUser: null, loadingUser: false }),
}))

// Utility function to load user into state
export async function loadUserIntoState(): Promise<void> {
  const result = await getUser()
  if (result.success && result.user) {
    useAuthStore.getState().setAuthUser(result.user)
  } else {
    useAuthStore.getState().setAuthUser(null)
  }
  useAuthStore.getState().setLoadingUser(false)
}
