import { useState, useCallback, useRef, useEffect } from 'react'
import type { RecorderState, Recording } from '@just-recordings/recorder'
import { RecorderService } from '@just-recordings/recorder'

export type FlowState = 'idle' | 'settings' | 'countdown' | 'recording' | 'saving'

export interface RecordingSettings {
  includeSystemAudio: boolean
  includeMicrophone: boolean
  includeWebcam: boolean
}

export interface UseRecordingFlowOptions {
  /** RecorderService instance to use. If not provided, a new instance will be created. */
  recorderService?: RecorderService
  /** Callback when a recording is saved and ready for upload */
  onRecordingSaved?: (recording: Recording) => void
}

export interface UseRecordingFlowReturn {
  // State
  flowState: FlowState
  recorderState: RecorderState
  currentSettings: RecordingSettings | null

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

  // For RecordingTimer
  getElapsedTime: () => number
}

/**
 * Hook that orchestrates the entire recording flow:
 * idle → settings → countdown → recording → saving → idle
 */
export function useRecordingFlow(options: UseRecordingFlowOptions = {}): UseRecordingFlowReturn {
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const [currentSettings, setCurrentSettings] = useState<RecordingSettings | null>(null)

  // Store options in ref to avoid stale closures
  const optionsRef = useRef(options)
  optionsRef.current = options

  // Create or use provided RecorderService
  const recorderServiceRef = useRef<RecorderService>(
    options.recorderService ?? new RecorderService(),
  )

  // Subscribe to recorder state changes
  useEffect(() => {
    const unsubscribe = recorderServiceRef.current.onStateChange((state) => {
      setRecorderState(state)
    })
    return unsubscribe
  }, [])

  const openSettings = useCallback(() => {
    setFlowState('settings')
  }, [])

  const closeSettings = useCallback(() => {
    setFlowState('idle')
  }, [])

  const startWithSettings = useCallback((settings: RecordingSettings) => {
    setCurrentSettings(settings)
    setFlowState('countdown')
  }, [])

  const onCountdownComplete = useCallback(async () => {
    if (!currentSettings) return

    await recorderServiceRef.current.startScreenRecording({
      includeSystemAudio: currentSettings.includeSystemAudio,
      includeMicrophone: currentSettings.includeMicrophone,
      includeWebcam: currentSettings.includeWebcam,
    })
    setFlowState('recording')
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
    optionsRef.current.onRecordingSaved?.(recording)
    setCurrentSettings(null)
    setFlowState('idle')
  }, [])

  const cancel = useCallback(() => {
    recorderServiceRef.current.cancelRecording()
    setCurrentSettings(null)
    setFlowState('idle')
  }, [])

  const restart = useCallback(() => {
    recorderServiceRef.current.cancelRecording()
    // Keep currentSettings intact for restart
    setFlowState('countdown')
  }, [])

  const getElapsedTime = useCallback(() => {
    return recorderServiceRef.current.getElapsedTime()
  }, [])

  return {
    flowState,
    recorderState,
    currentSettings,
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
  }
}
