import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Container,
  Typography,
  List,
  ListItem,
  LinearProgress,
  Chip,
} from '@mui/material'
import type { UploadManager, Recording } from '@just-recordings/recorder'

export interface UploadQueueProps {
  uploadManager: UploadManager
}

function UploadQueue({ uploadManager }: UploadQueueProps) {
  const [queue, setQueue] = useState<Recording[]>([])

  useEffect(() => {
    const unsubscribe = uploadManager.onQueueChange(setQueue)
    return unsubscribe
  }, [uploadManager])

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

  const getStatusLabel = (status: Recording['uploadStatus']) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'uploading':
        return 'Uploading'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

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
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Upload Queue
        </Typography>

        {queue.length === 0 ? (
          <Box data-testid="empty-state" sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No pending uploads
            </Typography>
          </Box>
        ) : (
          <List>
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
                        label={getStatusLabel(recording.uploadStatus)}
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
        )}
      </Box>
    </Container>
  )
}

export default UploadQueue
