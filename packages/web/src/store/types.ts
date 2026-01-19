import { type User } from '@supabase/supabase-js'

export interface AppUser {
  displayName: string
  email: string
  id: string
}

export interface State {
  authUser: User | null
  setAuthUser: (authUser: User | null) => void
  loadingUser: boolean
  setLoadingUser: (loadingUser: boolean) => void
  appUser: AppUser | null
  setAppUser: (appUser: AppUser | null) => void
}
