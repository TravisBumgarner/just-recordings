import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteRecording } from '@/api/recordings'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useDeleteRecording() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteRecording(id)
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    onSuccess: (_data, id) => {
      // Invalidate recordings list
      queryClient.invalidateQueries({ queryKey: queryKeys.recordings })
      // Remove specific recording from cache
      queryClient.removeQueries({ queryKey: queryKeys.recording(id) })
      // Remove associated media from cache
      queryClient.removeQueries({ queryKey: queryKeys.video(id) })
      queryClient.removeQueries({ queryKey: queryKeys.thumbnail(id) })
    },
  })
}
