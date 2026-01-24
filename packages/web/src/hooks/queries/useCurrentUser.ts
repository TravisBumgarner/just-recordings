import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/api/users'
import { ApiError } from '@/lib/ApiError'
import { getUser } from '@/services/supabase'

export function useAuthUser() {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const result = await getUser()
      if (!result.success || !result.user) {
        return null
      }
      return result.user
    },
    staleTime: Number.POSITIVE_INFINITY, // Auth state managed by Supabase
  })
}

export function useCurrentUser() {
  const { data: authUser } = useAuthUser()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await getMe()
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
