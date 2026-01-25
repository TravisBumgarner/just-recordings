import type { Recording } from '@just-recordings/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRecording } from '@/api/recordings'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

export function useUpdateRecording() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await updateRecording(id, { name })
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.recording(id) })

      // Snapshot the previous value
      const previousRecording = queryClient.getQueryData<Recording>(queryKeys.recording(id))

      // Optimistically update the cache
      if (previousRecording) {
        queryClient.setQueryData<Recording>(queryKeys.recording(id), {
          ...previousRecording,
          name,
        })
      }

      return { previousRecording }
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previousRecording) {
        queryClient.setQueryData(queryKeys.recording(id), context.previousRecording)
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.recording(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.recordings })
    },
  })
}
