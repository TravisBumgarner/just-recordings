import type { AcquiredScreen, RecorderState, Recording } from '@just-recordings/recorder'
import { RecorderService } from '@just-recordings/recorder'
import { useCallback, useEffect, useRef, useState } from 'react'

export type FlowState =
  | 'idle'
  | 'settings'
  | 'acquiring'
  | 'countdown'
  | 'recording'
  | 'saving'
  | 'naming'

export interface RecordingSettings {
  includeSystemAudio: boolean
  includeMicrophone: boolean
  includeWebcam: boolean
  autoUpload?: boolean
  microphoneDeviceId?: string
  webcamDeviceId?: string
}

export interface UseRecordingFlowOptions {
  /** RecorderService instance to use. If not provided, a new instance will be created. */
  recorderService?: RecorderService
  /** Callback when a recording is saved and ready for upload */
  onRecordingSaved?: (recording: Recording, settings: RecordingSettings) => void
}

export interface UseRecordingFlowReturn {
  // State
  flowState: FlowState
  recorderState: RecorderState
  currentSettings: RecordingSettings | null
  /** The stopped recording waiting to be named (available in 'naming' state) */
  pendingRecording: Recording | null

  // Actions
  openSettings: () => void
  closeSettings: () => void
  startWithSettings: (settings: RecordingSettings) => void
  onCountdownComplete: () => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => Promise<void>
  cancel: () => void
  restart: () => void
  /** Called after user names the recording to complete the save */
  finishWithName: (name: string) => void

  // For RecordingTimer
  getElapsedTime: () => number
}

/**
 * Hook that orchestrates the entire recording flow:
 * idle → settings → acquiring → countdown → recording → saving → naming → idle
 */
export function useRecordingFlow(options: UseRecordingFlowOptions = {}): UseRecordingFlowReturn {
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const [currentSettings, setCurrentSettings] = useState<RecordingSettings | null>(null)
  const [pendingRecording, setPendingRecording] = useState<Recording | null>(null)

  // Store options in ref to avoid stale closures
  const optionsRef = useRef(options)
  optionsRef.current = options

  // Create or use provided RecorderService
  const recorderServiceRef = useRef<RecorderService>(
    options.recorderService ?? new RecorderService(),
  )

  // Store acquired screen stream for use after countdown
  const acquiredScreenRef = useRef<AcquiredScreen | null>(null)

  // Subscribe to recorder state changes
  useEffect(() => {
    const unsubscribe = recorderServiceRef.current.onStateChange((state) => {
      setRecorderState(state)
    })
    return unsubscribe
  }, [])

  // Store stop function in ref for use in stream ended handler
  const stopRef = useRef<() => Promise<void>>(() => Promise.resolve())

  // Subscribe to stream ended events (e.g., Chrome's native "Stop sharing" button)
  useEffect(() => {
    const unsubscribe = recorderServiceRef.current.onStreamEnded(() => {
      // Auto-stop recording when stream ends externally
      stopRef.current()
    })
    return unsubscribe
  }, [])

  const openSettings = useCallback(() => {
    setFlowState('settings')
  }, [])

  const closeSettings = useCallback(() => {
    setFlowState('idle')
  }, [])

  const startWithSettings = useCallback(async (settings: RecordingSettings) => {
    setCurrentSettings(settings)
    setFlowState('acquiring')

    try {
      // Acquire screen stream before countdown
      const acquiredScreen = await recorderServiceRef.current.acquireScreen({
        includeSystemAudio: settings.includeSystemAudio,
      })
      acquiredScreenRef.current = acquiredScreen
      setFlowState('countdown')
    } catch {
      // User cancelled screen picker or error occurred - return to settings
      setFlowState('settings')
    }
  }, [])

  const onCountdownComplete = useCallback(async () => {
    if (!currentSettings) return

    // Use the pre-acquired screen stream
    const acquiredScreen = acquiredScreenRef.current
    acquiredScreenRef.current = null // Clear ref since stream is now owned by recorder

    // Verify the stream exists and is still valid (has active tracks)
    const screenStream = acquiredScreen?.stream
    // Check if stream has getVideoTracks method (real MediaStream) and if tracks are live
    const hasActiveVideoTrack =
      typeof screenStream?.getVideoTracks === 'function'
        ? screenStream.getVideoTracks().some((track) => track.readyState === 'live')
        : !!screenStream // For mocked streams, just check existence

    if (!screenStream || !hasActiveVideoTrack) {
      // Stream became invalid - release and return to idle (not settings, to avoid modal flash)
      acquiredScreen?.release()
      setCurrentSettings(null)
      setFlowState('idle')
      return
    }

    try {
      await recorderServiceRef.current.startScreenRecording({
        includeSystemAudio: currentSettings.includeSystemAudio,
        includeMicrophone: currentSettings.includeMicrophone,
        includeWebcam: currentSettings.includeWebcam,
        screenStream,
      })
      setFlowState('recording')
    } catch {
      // If recording fails, release the stream and return to idle (not settings, to avoid modal flash)
      acquiredScreen?.release()
      setCurrentSettings(null)
      setFlowState('idle')
    }
  }, [currentSettings])

  const pause = useCallback(() => {
    recorderServiceRef.current.pauseRecording()
  }, [])

  const resume = useCallback(() => {
    recorderServiceRef.current.resumeRecording()
  }, [])

  const stop = useCallback(async () => {
    setFlowState('saving')
    const recording = await recorderServiceRef.current.stopRecording()
    // Store the recording and transition to naming state
    setPendingRecording(recording)
    setFlowState('naming')
  }, [])

  const finishWithName = useCallback(
    (name: string) => {
      if (!pendingRecording || !currentSettings) return

      // Create recording with the user-provided name
      const namedRecording: Recording = {
        ...pendingRecording,
        name,
      }

      optionsRef.current.onRecordingSaved?.(namedRecording, currentSettings)
      setPendingRecording(null)
      setCurrentSettings(null)
      setFlowState('idle')
    },
    [pendingRecording, currentSettings],
  )

  // Keep stopRef up to date so stream ended handler uses current stop function
  useEffect(() => {
    stopRef.current = stop
  }, [stop])

  const cancel = useCallback(() => {
    // Release any acquired screen stream that hasn't been used
    if (acquiredScreenRef.current) {
      acquiredScreenRef.current.release()
      acquiredScreenRef.current = null
    }
    recorderServiceRef.current.cancelRecording()
    setCurrentSettings(null)
    setFlowState('idle')
  }, [])

  const restart = useCallback(async () => {
    recorderServiceRef.current.cancelRecording()
    // Keep currentSettings intact for restart
    // Need to re-acquire screen since the old stream was used or stopped
    if (currentSettings) {
      setFlowState('acquiring')
      try {
        const acquiredScreen = await recorderServiceRef.current.acquireScreen({
          includeSystemAudio: currentSettings.includeSystemAudio,
        })
        acquiredScreenRef.current = acquiredScreen
        setFlowState('countdown')
      } catch {
        // User cancelled - return to settings
        setFlowState('settings')
      }
    } else {
      setFlowState('settings')
    }
  }, [currentSettings])

  const getElapsedTime = useCallback(() => {
    return recorderServiceRef.current.getElapsedTime()
  }, [])

  return {
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
  }
}
