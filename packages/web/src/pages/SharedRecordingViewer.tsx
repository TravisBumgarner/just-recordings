import { Box, CircularProgress, Container, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import { errorMessages } from '@just-recordings/shared'
import { getPublicVideoUrl } from '@/api/shares'
import { usePublicRecording } from '@/hooks/queries/useShares'
import { ApiError } from '@/lib/ApiError'

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function SharedRecordingViewer() {
  const { token } = useParams<{ token: string }>()
  const { data: recording, isLoading, error } = usePublicRecording(token)

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
          data-testid="loading-indicator"
        >
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error || !recording) {
    const errorCode = error instanceof ApiError ? error.errorCode : 'SHARE_NOT_FOUND'
    const message = errorMessages[errorCode] || 'This recording is not available'

    return (
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
            textAlign: 'center',
          }}
          data-testid="error-state"
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Recording Unavailable
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {message}
          </Typography>
        </Box>
      </Container>
    )
  }

  const videoUrl = token ? getPublicVideoUrl(token) : undefined

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {recording.name}
      </Typography>

      {videoUrl && (
        <Box sx={{ mb: 3 }}>
          <video
            data-testid="video-player"
            src={videoUrl}
            controls
            style={{ width: '100%', maxHeight: '70vh' }}
          >
            <track kind="captions" srcLang="en" label="English" />
          </video>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Duration: {formatDuration(recording.duration)}
        </Typography>
      </Box>
    </Container>
  )
}

export default SharedRecordingViewer
