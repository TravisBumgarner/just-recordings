import type {
  RecorderService,
  Recording,
  UploadManager,
} from '@just-recordings/recorder'
import { Box, Button, Chip, LinearProgress, List, ListItem, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from '@/sharedComponents/Link'
import PageWrapper from '@/styles/shared/PageWrapper'
import { generateAbsoluteUrl } from '@/utils/generateAbsoluteUrl'
import { setRecordingState } from '../utils/electron'
import { SetupWizard } from '../components/SetupWizard'
import { useSetupStatus } from '../hooks/useSetupStatus'
import { useRecordingFlow } from '../hooks/useRecordingFlow'
import { RecordingSettingsModal } from '../components/RecordingSettingsModal'
import { CountdownOverlay } from '../components/CountdownOverlay'
import { RecordingControlsModal } from '../components/RecordingControlsModal'

export interface HomeProps {
  recorderService: RecorderService
  uploadManager: UploadManager
}

function Home({ recorderService, uploadManager }: HomeProps) {
  const [queue, setQueue] = useState<Recording[]>([])
  const { isSetupComplete, markSetupComplete } = useSetupStatus()

  // Handle recording saved - enqueue for upload and update tray icon
  const handleRecordingSaved = useCallback(
    async (recording: Recording) => {
      setRecordingState(false)
      await uploadManager.enqueue(recording)
    },
    [uploadManager],
  )

  // Use the recording flow hook
  const {
    flowState,
    recorderState,
    openSettings,
    closeSettings,
    startWithSettings,
    onCountdownComplete,
    pause,
    resume,
    stop,
    cancel,
    restart,
    getElapsedTime,
  } = useRecordingFlow({
    recorderService,
    onRecordingSaved: handleRecordingSaved,
  })

  // Track previous flowState to detect transitions
  const prevFlowStateRef = useRef(flowState)
  useEffect(() => {
    // When transitioning to 'recording', update tray icon
    if (prevFlowStateRef.current === 'countdown' && flowState === 'recording') {
      setRecordingState(true)
    }
    // When cancelling (recording -> idle), update tray icon
    if (prevFlowStateRef.current === 'recording' && flowState === 'idle') {
      setRecordingState(false)
    }
    prevFlowStateRef.current = flowState
  }, [flowState])

  useEffect(() => {
    // Fetch initial queue state
    uploadManager.getQueue().then(setQueue)
    // Subscribe to queue changes
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

  const handleWizardComplete = useCallback(() => {
    // Wizard completed, now showing home screen
  }, [])

  // Show SetupWizard on first launch
  if (!isSetupComplete) {
    return (
      <PageWrapper width="full">
        <SetupWizard
          isSetupComplete={isSetupComplete}
          onComplete={handleWizardComplete}
          markSetupComplete={markSetupComplete}
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper width="full">
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

      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {flowState === 'idle' && (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={openSettings}
            >
              Start Recording
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
