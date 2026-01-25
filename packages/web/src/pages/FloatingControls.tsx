import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { FloatingControlsContent } from '../components/FloatingControlsContent'

/**
 * Recording state received from the main window via IPC
 */
export interface RecordingState {
  status: 'recording' | 'paused'
  elapsedTimeMs: number
  webcamEnabled: boolean
}

/**
 * Control actions that can be sent to the main window
 */
export type FloatingControlAction = 'stop' | 'pause' | 'resume' | 'cancel'

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

  // Request webcam stream when webcamEnabled is true
  useEffect(() => {
    if (!recordingState?.webcamEnabled) {
      // Clean up existing stream when webcam is disabled
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
        setWebcamStream(null)
      }
      return
    }

    let mounted = true

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
      }
    }

    requestWebcam()

    return () => {
      mounted = false
    }
  }, [recordingState?.webcamEnabled, webcamStream])

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

  return (
    <Box data-testid="floating-controls">
      <FloatingControlsContent
        recordingState={recordingState}
        onAction={sendControlAction}
      />
      {recordingState.webcamEnabled && (
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
