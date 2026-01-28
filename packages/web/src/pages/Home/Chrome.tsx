import type {
  RecorderService,
  Recording,
  UploadManager,
} from '@just-recordings/recorder'
import { Box, Button, Chip, LinearProgress, List, ListItem, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Link from '@/sharedComponents/Link'
import { generateAbsoluteUrl } from '@/utils/generateAbsoluteUrl'
import { useRecordingFlow } from '../../hooks/useRecordingFlow'
import { RecordingSettingsModal } from '../../components/RecordingSettingsModal'
import { CountdownOverlay } from '../../components/CountdownOverlay'
import { RecordingControlsModal } from '../../components/RecordingControlsModal'
import { generateDefaultRecordingName, RecordingNameModal } from '../../components/RecordingNameModal'

export interface HomeProps {
  recorderService: RecorderService
  uploadManager: UploadManager
}

function HomeChrome({ recorderService, uploadManager }: HomeProps) {
  const [queue, setQueue] = useState<Recording[]>([])

  const handleRecordingSaved = useCallback(
    async (recording: Recording) => {
      await uploadManager.enqueue(recording)
    },
    [uploadManager],
  )

  const {
    flowState,
    recorderState,
    pendingRecording,
    openSettings,
    closeSettings,
    startWithSettings,
    onCountdownComplete,
    pause,
    resume,
    stop,
    cancel,
    restart,
    finishWithName,
    getElapsedTime,
  } = useRecordingFlow({
    recorderService,
    onRecordingSaved: handleRecordingSaved,
  })

  useEffect(() => {
    uploadManager.getQueue().then(setQueue)
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
    <Box sx={{ width: 400, minHeight: 300, p: 2 }}>
      {/* Recording Settings Modal */}
      <RecordingSettingsModal
        open={flowState === 'settings'}
        onClose={closeSettings}
        onStartRecording={startWithSettings}
      />

      {/* Countdown Overlay */}
      {flowState === 'countdown' && (
        <CountdownOverlay seconds={3} onComplete={onCountdownComplete} />
      )}

      {/* Recording Controls Modal */}
      <RecordingControlsModal
        open={flowState === 'recording'}
        recorderState={recorderState}
        getElapsedTime={getElapsedTime}
        onStop={stop}
        onPause={pause}
        onResume={resume}
        onRestart={restart}
        onCancel={cancel}
      />

      {/* Recording Name Modal */}
      <RecordingNameModal
        open={flowState === 'naming'}
        defaultName={generateDefaultRecordingName(pendingRecording?.createdAt)}
        onSave={finishWithName}
        onCancel={() => {
          finishWithName(generateDefaultRecordingName(pendingRecording?.createdAt))
        }}
      />

      {/* Header */}
      <Typography variant="h6" component="h1" gutterBottom>
        Just Recordings
      </Typography>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" size="small" onClick={openSettings} disabled={flowState !== 'idle'}>
          Start Recording
        </Button>
        <Link href={generateAbsoluteUrl('home')} target="_blank">
          View Recordings
        </Link>
      </Box>

      {/* Upload Queue */}
      {queue.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Upload Queue ({queue.length})
          </Typography>
          <List disablePadding>
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
                  px: 1.5,
                  py: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>{recording.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={recording.uploadStatus}
                        size="small"
                        color={getStatusColor(recording.uploadStatus)}
                      />
                      {recording.uploadStatus === 'uploading' &&
                        recording.uploadProgress !== undefined && (
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(recording.uploadProgress)}%
                          </Typography>
                        )}
                      {recording.uploadStatus === 'failed' && recording.uploadError && (
                        <Typography variant="caption" color="error" noWrap>
                          {recording.uploadError}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0 }}>
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
  )
}

export default HomeChrome
