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
import { generateDefaultRecordingName, RecordingNameModal } from '../components/RecordingNameModal'
import { Settings } from '../components/Settings'
import type { FloatingControlAction } from './FloatingControls'

export interface HomeProps {
  recorderService: RecorderService
  uploadManager: UploadManager
}

function Home({ recorderService, uploadManager }: HomeProps) {
  const [queue, setQueue] = useState<Recording[]>([])
  const [showSettings, setShowSettings] = useState(false)
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
    currentSettings,
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

  // Track previous flowState to detect transitions
  const prevFlowStateRef = useRef(flowState)
  useEffect(() => {
    // When transitioning to 'recording', update tray icon and show floating window
    if (prevFlowStateRef.current === 'countdown' && flowState === 'recording') {
      setRecordingState(true)
      window.api?.showFloatingControls()
    }
    // When recording ends (recording -> idle or saving), update tray icon and hide floating window
    if (prevFlowStateRef.current === 'recording' && (flowState === 'idle' || flowState === 'saving')) {
      setRecordingState(false)
      window.api?.hideFloatingControls()
    }
    prevFlowStateRef.current = flowState
  }, [flowState])

  // Sync recording state to floating window continuously during recording
  useEffect(() => {
    if (flowState !== 'recording') return

    const syncState = () => {
      window.api?.updateRecordingState({
        status: recorderState === 'paused' ? 'paused' : 'recording',
        elapsedTimeMs: getElapsedTime(),
        webcamEnabled: currentSettings?.includeWebcam ?? false,
      })
    }

    // Sync immediately and then every 100ms for smooth timer updates
    syncState()
    const intervalId = setInterval(syncState, 100)

    return () => clearInterval(intervalId)
  }, [flowState, recorderState, getElapsedTime, currentSettings])

  // Listen for control actions from the floating window
  useEffect(() => {
    const cleanup = window.api?.onFloatingControlAction((action: FloatingControlAction) => {
      switch (action) {
        case 'stop':
          stop()
          break
        case 'pause':
          pause()
          break
        case 'resume':
          resume()
          break
        case 'cancel':
          cancel()
          break
      }
    })
    return () => cleanup?.()
  }, [stop, pause, resume, cancel])

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

  // Auto-open settings modal on desktop when idle
  useEffect(() => {
    if (isSetupComplete && flowState === 'idle' && !showSettings) {
      openSettings()
    }
  }, [isSetupComplete, flowState, showSettings, openSettings])

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

      {/* Recording Name Modal */}
      <RecordingNameModal
        open={flowState === 'naming'}
        defaultName={generateDefaultRecordingName(pendingRecording?.createdAt)}
        onSave={finishWithName}
        onCancel={() => {
          // Cancel uses default name
          finishWithName(generateDefaultRecordingName(pendingRecording?.createdAt))
        }}
      />

      {/* Settings View */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}

      {/* Main View */}
      {!showSettings && (
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Link href={generateAbsoluteUrl('home')} target="_blank">
              View Recordings
            </Link>
            <Typography
              component="button"
              onClick={() => setShowSettings(true)}
              sx={{
                background: 'none',
                border: 'none',
                color: 'primary.main',
                cursor: 'pointer',
                textDecoration: 'underline',
                p: 0,
                fontSize: 'inherit',
              }}
            >
              Settings
            </Typography>
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
        </Box>
      )}
    </PageWrapper>
  )
}

export default Home
