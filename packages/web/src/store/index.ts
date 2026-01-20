import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { AppUser, State } from './types'

const useGlobalStore = create<State>()(
  devtools(
    (set) => ({
      authUser: undefined,
      loadingUser: true,
      appUser: undefined,
      setAppUser: (appUser: AppUser | null) => set({ appUser }),
      setAuthUser: (authUser: User | null) => set({ authUser }),
      setLoadingUser: (loadingUser: boolean) => set({ loadingUser }),
    }),
    {
      name: 'store',
    },
  ),
)

export default useGlobalStore
