# React Query Adoption

## Overview

Adopt `@tanstack/react-query` throughout the frontend to replace manual `useEffect` + `useState` data fetching patterns. This will provide automatic caching, request deduplication, background refetching, and simplified state management.

## Current State

### Data Fetching Patterns

The frontend currently uses basic `useEffect` + `useState` patterns for all API calls:

```typescript
// Current pattern (Home.Web.tsx)
const [recordings, setRecordings] = useState<ApiRecording[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(false)

useEffect(() => {
  const fetchRecordings = async () => {
    const response = await getRecordings()
    if (response.success) {
      setRecordings(response.recordings)
    } else {
      setError(true)
    }
    setLoading(false)
  }
  fetchRecordings()
}, [])
```

### Problems with Current Approach

1. **No caching** - Same data fetched multiple times
2. **Manual state management** - Boilerplate for loading/error/data states
3. **No request deduplication** - Multiple components can trigger duplicate requests
4. **Manual refetch** - Using `setTimeout` hacks after mutations
5. **Inconsistent error handling** - Mix of old and new API response formats

### Existing Infrastructure

- `@tanstack/react-query` is already installed
- `QueryClientProvider` is already set up in `App.tsx`
- Standardized `ApiResponse<T>` type exists in shared package
- `useApiError` hook exists for error handling

## Design

### Query Hooks

Create custom hooks that wrap `useQuery` for each data type:

```typescript
// hooks/queries/useRecordings.ts
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

export function useRecording(id: string) {
  return useQuery({
    queryKey: ['recordings', id],
    queryFn: async () => {
      const response = await getRecording(id)
      if (!response.success) {
        throw new ApiError(response.errorCode)
      }
      return response.data
    },
    enabled: !!id,
  })
}
```

### Mutation Hooks

Create hooks for data mutations with automatic cache invalidation:

```typescript
// hooks/mutations/useDeleteRecording.ts
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] })
    },
  })
}
```

### Blob URL Handling

Video and thumbnail URLs require special handling since they're blob URLs:

```typescript
// hooks/queries/useRecordingMedia.ts
export function useVideoUrl(id: string) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: () => getVideoUrl(id),
    enabled: !!id,
    staleTime: Infinity, // Blob URLs don't change
    gcTime: 1000 * 60 * 30, // Keep for 30 minutes
  })
}

export function useThumbnailUrl(id: string, hasThumbnail: boolean) {
  return useQuery({
    queryKey: ['thumbnail', id],
    queryFn: () => getThumbnailUrl(id),
    enabled: !!id && hasThumbnail,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  })
}
```

### API Response Standardization

Standardize remaining API functions to use `ApiResponse<T>` format:

```typescript
// Before (old format)
export const getRecordings = async (): Promise<GetRecordingsResult>
// { success: true, recordings: [...] } | { success: false, message: string }

// After (standardized)
export const getRecordings = async (): Promise<ApiResponse<Recording[]>>
// { success: true, data: [...] } | { success: false, errorCode: ErrorCode }
```

### Error Handling

Create a custom `ApiError` class for react-query error handling:

```typescript
// lib/ApiError.ts
export class ApiError extends Error {
  constructor(public errorCode: ErrorCode) {
    super(errorMessages[errorCode])
    this.name = 'ApiError'
  }
}
```

Integrate with existing `useApiError` hook or create a query-aware version.

### QueryClient Configuration

Update the QueryClient with sensible defaults:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
```

## Files to Modify

### New Files
- `packages/web/src/lib/ApiError.ts` - Custom error class
- `packages/web/src/hooks/queries/useRecordings.ts` - Recording queries
- `packages/web/src/hooks/queries/useRecordingMedia.ts` - Blob URL queries
- `packages/web/src/hooks/queries/useHealth.ts` - Health check query
- `packages/web/src/hooks/queries/useUser.ts` - User queries
- `packages/web/src/hooks/mutations/useDeleteRecording.ts` - Delete mutation

### Modified Files
- `packages/web/src/api/recordings.ts` - Standardize response format
- `packages/web/src/api/users.ts` - Standardize response format
- `packages/web/src/api/health.ts` - Standardize response format
- `packages/web/src/App.tsx` - Update QueryClient config
- `packages/web/src/pages/Home.Web.tsx` - Use query hooks
- `packages/web/src/pages/Home.Desktop.tsx` - Use query hooks (if applicable)
- `packages/web/src/pages/RecordingViewer.tsx` - Use query hooks
- `packages/web/src/hooks/useHealthCheck.ts` - Refactor to use react-query
- `packages/web/src/hooks/useLoadUserIntoState.ts` - Refactor to use react-query

### Files to Delete
- `packages/shared/src/api/recordings.ts` - Old response types (after migration)

## Component Updates

### Home.Web.tsx (Before)
```typescript
const [recordings, setRecordings] = useState<ApiRecording[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(false)

useEffect(() => {
  const fetchRecordings = async () => {
    const response = await getRecordings()
    if (response.success) {
      setRecordings(response.recordings)
    } else {
      setError(true)
    }
    setLoading(false)
  }
  fetchRecordings()
}, [])

// Manual refetch after upload
setTimeout(async () => {
  const response = await getRecordings()
  if (response.success) {
    setRecordings(response.recordings)
  }
}, 1000)
```

### Home.Web.tsx (After)
```typescript
const { data: recordings = [], isLoading, error } = useRecordings()
const queryClient = useQueryClient()

// After upload completes
queryClient.invalidateQueries({ queryKey: ['recordings'] })
```

### RecordingViewer.tsx (Before)
```typescript
const [recording, setRecording] = useState<Recording | null>(null)
const [loading, setLoading] = useState(true)
const [videoUrl, setVideoUrl] = useState<string | null>(null)

useEffect(() => {
  const fetchRecording = async () => { ... }
  fetchRecording()
}, [id])

useEffect(() => {
  const fetchVideoUrl = async () => { ... }
  fetchVideoUrl()
}, [id])

const handleDeleteConfirm = async () => {
  const response = await deleteRecordingV2(recording.id)
  if (handleResponse(response)) {
    navigate('/')
  }
}
```

### RecordingViewer.tsx (After)
```typescript
const { data: recording, isLoading, error } = useRecording(id)
const { data: videoUrl } = useVideoUrl(id)
const deleteRecording = useDeleteRecording()

const handleDeleteConfirm = () => {
  deleteRecording.mutate(recording.id, {
    onSuccess: () => navigate('/'),
  })
}
```

## Migration Strategy

1. **Phase 1**: Create infrastructure (ApiError, QueryClient config)
2. **Phase 2**: Standardize API response formats
3. **Phase 3**: Create query hooks for recordings
4. **Phase 4**: Create mutation hooks
5. **Phase 5**: Update components to use hooks
6. **Phase 6**: Create media (blob) query hooks
7. **Phase 7**: Migrate health check and user loading
8. **Phase 8**: Clean up old code

## Testing Considerations

- Query hooks should be tested with `@tanstack/react-query` test utilities
- Mock API functions at the module level
- Test loading, success, and error states
- Test cache invalidation after mutations
