import { useQuery } from '@tanstack/react-query'
import { getPublicRecording, getShares } from '@/api/shares'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useShares(recordingId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shares(recordingId ?? ''),
    queryFn: async () => {
      if (!recordingId) throw new Error('Recording ID is required')
      const response = await getShares(recordingId)
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    enabled: !!recordingId,
  })
}

export function usePublicRecording(token: string | undefined) {
  return useQuery({
    queryKey: queryKeys.publicRecording(token ?? ''),
    queryFn: async () => {
      if (!token) throw new Error('Share token is required')
      const response = await getPublicRecording(token)
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    enabled: !!token,
  })
}
