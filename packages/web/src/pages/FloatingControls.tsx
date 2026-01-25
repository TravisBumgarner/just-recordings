import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { FloatingControlsContent } from '../components/FloatingControlsContent'

/**
 * Recording state received from the main window via IPC
 */
export interface RecordingState {
  status: 'recording' | 'paused' | 'countdown'
  elapsedTimeMs: number
  webcamEnabled: boolean
  countdownSeconds?: number
}

/**
 * Control actions that can be sent to the main window
 */
export type FloatingControlAction = 'stop' | 'pause' | 'resume' | 'cancel' | 'restart'

/**
 * Props for the FloatingControls component
 */
export interface FloatingControlsProps {
  /**
   * Optional initial state for testing
   */
  initialState?: RecordingState
}

/**
 * FloatingControls page component rendered in the floating window.
 * Listens for recording state updates via IPC and allows sending control actions.
 * Displays webcam preview when webcam is enabled.
 */
function FloatingControls({ initialState }: FloatingControlsProps) {
  const [recordingState, setRecordingState] = useState<RecordingState | null>(
    initialState ?? null,
  )
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Subscribe to recording state updates from main window
  useEffect(() => {
    const cleanup = window.api?.onRecordingStateUpdate((state: RecordingState) => {
      setRecordingState(state)
    })
    return () => {
      cleanup?.()
    }
  }, [])

  // Track if we're currently requesting webcam to avoid duplicate requests
  const isRequestingWebcamRef = useRef(false)

  // Request webcam stream when webcamEnabled is true (including during countdown)
  useEffect(() => {
    // Clean up existing stream when webcam is disabled
    if (!recordingState?.webcamEnabled) {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
        setWebcamStream(null)
      }
      isRequestingWebcamRef.current = false
      return
    }

    // Skip if we already have a stream or are currently requesting one
    if (webcamStream || isRequestingWebcamRef.current) {
      return
    }

    let mounted = true
    isRequestingWebcamRef.current = true

    const requestWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
        if (mounted) {
          setWebcamStream(stream)
        } else {
          // Component unmounted before we got the stream
          stream.getTracks().forEach((track) => track.stop())
        }
      } catch (error) {
        console.error('Failed to get webcam stream:', error)
      } finally {
        if (mounted) {
          isRequestingWebcamRef.current = false
        }
      }
    }

    requestWebcam()

    return () => {
      mounted = false
    }
  }, [recordingState?.webcamEnabled, webcamStream])

  // Check if we should show webcam (during countdown or recording)
  const showWebcam = recordingState?.webcamEnabled && webcamStream

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream
    }
  }, [webcamStream])

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [webcamStream])

  // Handler to send control actions to main window
  const sendControlAction = useCallback((action: FloatingControlAction) => {
    window.api?.sendFloatingControlAction(action)
  }, [])

  if (!recordingState) {
    return (
      <Box data-testid="floating-controls-loading">
        <Typography>Waiting for recording state...</Typography>
      </Box>
    )
  }

  // Show countdown with webcam overlay when in countdown state
  if (recordingState.status === 'countdown' && recordingState.countdownSeconds !== undefined) {
    return (
      <Box
        data-testid="floating-controls-countdown"
        sx={{
          position: 'relative',
          minHeight: showWebcam ? 'auto' : 150,
          backgroundColor: showWebcam ? 'transparent' : 'rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Webcam during countdown */}
        {showWebcam && (
          <Box
            data-testid="webcam-preview"
            sx={{
              overflow: 'hidden',
              borderRadius: 1,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%',
                display: 'block',
                objectFit: 'cover',
              }}
            />
          </Box>
        )}
        {/* Countdown overlay */}
        <Box
          sx={{
            position: showWebcam ? 'absolute' : 'relative',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: showWebcam ? 'auto' : 150,
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {recordingState.countdownSeconds}
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box data-testid="floating-controls">
      <FloatingControlsContent
        recordingState={recordingState}
        onAction={sendControlAction}
      />
      {showWebcam && (
        <Box
          data-testid="webcam-preview"
          sx={{
            mt: 1,
            mx: 1,
            overflow: 'hidden',
            borderRadius: 1,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              display: 'block',
              objectFit: 'cover',
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default FloatingControls
