import type {
  RecorderService,
  RecorderState,
  Recording,
  UploadManager,
} from '@just-recordings/recorder'
import type { Recording as ApiRecording } from '@just-recordings/shared'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  List,
  ListItem,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useThumbnailUrl } from '@/hooks/queries/useRecordingMedia'
import { useRecordings } from '@/hooks/queries/useRecordings'
import { queryKeys } from '@/lib/queryKeys'
import PageWrapper from '@/styles/shared/PageWrapper'
import { setRecordingState } from '../utils/electron'

export interface HomeProps {
  recorderService: RecorderService
  uploadManager: UploadManager
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function RecordingCard({ recording }: { recording: ApiRecording }) {
  const { data: thumbnailUrl, isLoading: thumbnailLoading } = useThumbnailUrl(
    recording.id,
    !!recording.thumbnailUrl
  )

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardActionArea
          component={Link}
          to={`/recordings/${recording.id}`}
          aria-label={recording.name}
        >
          {thumbnailLoading ? (
            <Box
              sx={{
                height: 180,
                bgcolor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={40} />
            </Box>
          ) : thumbnailUrl ? (
            <CardMedia
              component="img"
              height="180"
              image={thumbnailUrl}
              alt={recording.name}
              sx={{
                bgcolor: 'grey.300',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                height: 180,
                bgcolor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No thumbnail
              </Typography>
            </Box>
          )}
          <CardContent>
            <Typography variant="h6" component="h2" noWrap>
              {recording.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDuration(recording.duration)} &bull;{' '}
              {formatDate(recording.createdAt)}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

function Home({ recorderService, uploadManager }: HomeProps) {
  const queryClient = useQueryClient()
  const { data: recordings = [], isLoading, isError } = useRecordings()
  const [queue, setQueue] = useState<Recording[]>([])
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const previousQueueRef = useRef<Recording[]>([])

  useEffect(() => {
    // Fetch initial queue state
    uploadManager.getQueue().then(setQueue)

    // Subscribe to queue changes and detect completed uploads
    const unsubscribe = uploadManager.onQueueChange((newQueue) => {
      const prevQueue = previousQueueRef.current

      // Find recordings that were uploading but are now gone (completed)
      const completedUploads = prevQueue.filter(
        (prev) =>
          prev.uploadStatus === 'uploading' &&
          !newQueue.some((curr) => curr.id === prev.id)
      )

      // If any uploads completed, invalidate recordings list
      if (completedUploads.length > 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.recordings })
      }

      previousQueueRef.current = newQueue
      setQueue(newQueue)
    })

    return unsubscribe
  }, [uploadManager, queryClient])

  useEffect(() => {
    const unsubscribe = recorderService.onStateChange(setRecorderState)
    return unsubscribe
  }, [recorderService])

  const handleStartRecording = useCallback(async () => {
    await recorderService.startScreenRecording()
    setRecordingState(true)
  }, [recorderService])

  const handleStopRecording = useCallback(async () => {
    setRecordingState(false)
    const recording = await recorderService.stopRecording()
    await uploadManager.enqueue(recording)
    // Invalidation happens automatically via onQueueChange when upload completes
  }, [recorderService, uploadManager])

  const handleRetry = useCallback(
    (id: number) => {
      uploadManager.retry(id)
    },
    [uploadManager],
  )

  const handleCancel = useCallback(
    (id: number) => {
      uploadManager.cancel(id)
    },
    [uploadManager],
  )

  const getStatusColor = (status: Recording['uploadStatus']): 'default' | 'primary' | 'error' => {
    switch (status) {
      case 'pending':
        return 'default'
      case 'uploading':
        return 'primary'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <PageWrapper width="full">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
          {recorderState === 'idle' ? (
            <Button variant="contained" color="primary" size="large" onClick={handleStartRecording}>
              Start Recording
            </Button>
          ) : (
            <Button variant="contained" color="error" size="large" onClick={handleStopRecording}>
              Stop Recording
            </Button>
          )}
        </Box>

        {queue.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upload Queue ({queue.length})
            </Typography>
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
              {queue.map((recording) => (
                <ListItem
                  key={recording.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1">{recording.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={recording.uploadStatus}
                          size="small"
                          color={getStatusColor(recording.uploadStatus)}
                        />
                        {recording.uploadStatus === 'uploading' &&
                          recording.uploadProgress !== undefined && (
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(recording.uploadProgress)}%
                            </Typography>
                          )}
                        {recording.uploadStatus === 'failed' && recording.uploadError && (
                          <Typography variant="body2" color="error">
                            {recording.uploadError}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {recording.uploadStatus === 'failed' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleRetry(recording.id!)}
                        >
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleCancel(recording.id!)}
                      >
                        {recording.uploadStatus === 'uploading' ? 'Cancel' : 'Delete'}
                      </Button>
                    </Box>
                  </Box>
                  {recording.uploadStatus === 'uploading' && (
                    <LinearProgress
                      variant="determinate"
                      value={recording.uploadProgress || 0}
                      sx={{ mt: 1, width: '100%' }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {isLoading && (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
            data-testid="loading-indicator"
          >
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Box sx={{ textAlign: 'center', py: 4 }} data-testid="error-state">
            <Typography variant="h6" color="text.secondary">
              Failed to load recordings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please try again later.
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && recordings.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }} data-testid="empty-state">
            <Typography variant="h6" color="text.secondary">
              No recordings yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start recording to see your videos here.
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && recordings.length > 0 && (
          <Grid container spacing={3}>
            {recordings.map((recording) => (
              <RecordingCard key={recording.id} recording={recording} />
            ))}
          </Grid>
        )}
      </Box>
    </PageWrapper>
  )
}

export default Home
