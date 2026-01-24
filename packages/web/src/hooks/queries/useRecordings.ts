import { useQuery } from '@tanstack/react-query'
import { getRecording, getRecordings } from '@/api/recordings'
import { ApiError } from '@/lib/ApiError'

export function useRecordings() {
  return useQuery({
    queryKey: ['recordings'],
    queryFn: async () => {
      const response = await getRecordings()
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
  })
}

export function useRecording(id: string | undefined) {
  return useQuery({
    queryKey: ['recordings', id],
    queryFn: async () => {
      if (!id) throw new Error('Recording ID is required')
      const response = await getRecording(id)
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    enabled: !!id,
  })
}
