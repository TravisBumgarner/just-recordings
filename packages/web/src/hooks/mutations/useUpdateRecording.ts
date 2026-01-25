import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRecording } from '@/api/recordings'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useUpdateRecording() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      // Stub: will be implemented in ralph-code phase
      const response = await updateRecording(id, { name })
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    onSuccess: (_data, { id }) => {
      // Stub: cache update will be implemented in ralph-code phase
      queryClient.invalidateQueries({ queryKey: queryKeys.recording(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.recordings })
    },
  })
}
