// Stub - to be implemented with Zustand
import type { User } from '@just-recordings/shared/auth'

export interface AuthState {
  authUser: User | null
  loadingUser: boolean
  setAuthUser: (user: User | null) => void
  setLoadingUser: (loading: boolean) => void
  clearAuth: () => void
}

// Stub store - will be replaced with Zustand implementation
export const useAuthStore = (): AuthState => {
  return {
    authUser: null,
    loadingUser: true,
    setAuthUser: () => {},
    setLoadingUser: () => {},
    clearAuth: () => {},
  }
}

// Utility function to load user into state
export async function loadUserIntoState(): Promise<void> {
  // Stub - to be implemented
}
