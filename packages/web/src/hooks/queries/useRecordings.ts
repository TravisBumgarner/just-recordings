import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getRecording, getRecordings, type PaginatedRecordings } from '@/api/recordings'
import { ApiError } from '@/lib/ApiError'
import { queryKeys } from '@/lib/queryKeys'

const DEFAULT_PAGE_SIZE = 20

export interface UseRecordingsOptions {
  page?: number
  limit?: number
}

export function useRecordings(options: UseRecordingsOptions = {}) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE } = options
  const offset = (page - 1) * limit

  return useQuery({
    queryKey: queryKeys.recordings(page, limit),
    queryFn: async (): Promise<PaginatedRecordings> => {
      const response = await getRecordings({ limit, offset })
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    placeholderData: keepPreviousData,
  })
}

export function useRecording(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.recording(id ?? ''),
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
