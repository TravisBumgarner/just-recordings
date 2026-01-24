import { useQuery } from '@tanstack/react-query'
import { checkHealth } from '@/api/health'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const response = await checkHealth()
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    retry: 2,
    staleTime: 1000 * 60, // 1 minute
  })
}
