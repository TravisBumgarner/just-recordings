import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ShareType } from '@just-recordings/shared'
import { createShare, revokeShare } from '@/api/shares'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

interface CreateShareParams {
  recordingId: string
  shareType: ShareType
}

export function useCreateShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ recordingId, shareType }: CreateShareParams) => {
      const response = await createShare(recordingId, shareType)
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    onSuccess: (_data, { recordingId }) => {
      // Invalidate shares list for this recording
      queryClient.invalidateQueries({ queryKey: queryKeys.shares(recordingId) })
    },
  })
}

interface RevokeShareParams {
  recordingId: string
  shareId: string
}

export function useRevokeShare() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ recordingId, shareId }: RevokeShareParams) => {
      const response = await revokeShare(recordingId, shareId)
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    onSuccess: (_data, { recordingId }) => {
      // Invalidate shares list for this recording
      queryClient.invalidateQueries({ queryKey: queryKeys.shares(recordingId) })
    },
  })
}
