import type {
  RecorderService,
  RecorderState,
  Recording,
  UploadManager,
} from '@just-recordings/recorder'
import { Box, Button, Chip, LinearProgress, List, ListItem, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { ROUTES } from '@/consts'
import Link from '@/sharedComponents/Link'
import PageWrapper from '@/styles/shared/PageWrapper'
import { generateAbsoluteUrl } from '@/utils/generateAbsoluteUrl'
import { setRecordingState } from '../utils/electron'

export interface HomeProps {
  recorderService: RecorderService
  uploadManager: UploadManager
}

function Home({ recorderService, uploadManager }: HomeProps) {
  const [queue, setQueue] = useState<Recording[]>([])
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')

  useEffect(() => {
    // Fetch initial queue state
    uploadManager.getQueue().then(setQueue)
    // Subscribe to queue changes
    const unsubscribe = uploadManager.onQueueChange(setQueue)
    return unsubscribe
  }, [uploadManager])

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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {recorderState === 'idle' ? (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStartRecording}
            >
              Start Recording
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="large"
              onClick={handleStopRecording}
            >
              Stop Recording
            </Button>
          )}
        </Box>

        <Link href={generateAbsoluteUrl('home')} target="_blank">
          View Recordings
        </Link>

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
      </Box>
    </PageWrapper>
  )
}

export default Home
