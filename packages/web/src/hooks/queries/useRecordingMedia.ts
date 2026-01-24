import { useQuery } from '@tanstack/react-query'
import { getThumbnailUrl, getVideoUrl } from '@/api/recordings'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useVideoUrl(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.video(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Recording ID is required')
      const response = await getVideoUrl(id)
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    enabled: !!id,
    staleTime: Number.POSITIVE_INFINITY, // Blob URLs don't change
    gcTime: 1000 * 60 * 30, // Keep for 30 minutes
  })
}

export function useThumbnailUrl(id: string | undefined, hasThumbnail: boolean) {
  return useQuery({
    queryKey: queryKeys.thumbnail(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Recording ID is required')
      const response = await getThumbnailUrl(id)
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    enabled: !!id && hasThumbnail,
    staleTime: Number.POSITIVE_INFINITY, // Blob URLs don't change
    gcTime: 1000 * 60 * 30, // Keep for 30 minutes
  })
}
