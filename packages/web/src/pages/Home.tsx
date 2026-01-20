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
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '@/styles/shared/PageWrapper'
import { getRecordings, getThumbnailUrl } from '../api'

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

function Home({ recorderService, uploadManager }: HomeProps) {
  const [recordings, setRecordings] = useState<ApiRecording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [queue, setQueue] = useState<Recording[]>([])
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')

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

  useEffect(() => {
    const unsubscribe = uploadManager.onQueueChange(setQueue)
    return unsubscribe
  }, [uploadManager])

  useEffect(() => {
    const unsubscribe = recorderService.onStateChange(setRecorderState)
    return unsubscribe
  }, [recorderService])

  const handleStartRecording = useCallback(async () => {
    await recorderService.startScreenRecording()
  }, [recorderService])

  const handleStopRecording = useCallback(async () => {
    const recording = await recorderService.stopRecording()
    await uploadManager.enqueue(recording)
    // Refresh recordings list after a short delay to allow upload to complete
    setTimeout(async () => {
      const response = await getRecordings()
      if (response.success) {
        setRecordings(response.recordings)
      }
    }, 1000)
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
                        Cancel
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

        {loading && (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
            data-testid="loading-indicator"
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ textAlign: 'center', py: 4 }} data-testid="error-state">
            <Typography variant="h6" color="text.secondary">
              Failed to load recordings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please try again later.
            </Typography>
          </Box>
        )}

        {!loading && !error && recordings.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }} data-testid="empty-state">
            <Typography variant="h6" color="text.secondary">
              No recordings yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start recording to see your videos here.
            </Typography>
          </Box>
        )}

        {!loading && !error && recordings.length > 0 && (
          <Grid container spacing={3}>
            {recordings.map((recording) => (
              <Grid item xs={12} sm={6} md={4} key={recording.id}>
                <Card>
                  <CardActionArea
                    component={Link}
                    to={`/recordings/${recording.id}`}
                    aria-label={recording.name}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={recording.thumbnailPath ? getThumbnailUrl(recording.id) : undefined}
                      alt={recording.name}
                      sx={{
                        bgcolor: 'grey.300',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    {!recording.thumbnailPath && (
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
            ))}
          </Grid>
        )}
      </Box>
    </PageWrapper>
  )
}

export default Home
