import { useState, useCallback, useRef, useEffect } from 'react'
import type { RecorderState, Recording, RecordingOptions } from '@just-recordings/recorder'
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
  onCountdownComplete: () => void
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

  // Create or use provided RecorderService
  const recorderServiceRef = useRef<RecorderService>(
    options.recorderService ?? new RecorderService(),
  )

  // TODO: Implement all methods
  const openSettings = useCallback(() => {}, [])
  const closeSettings = useCallback(() => {}, [])
  const startWithSettings = useCallback((_settings: RecordingSettings) => {}, [])
  const onCountdownComplete = useCallback(() => {}, [])
  const pause = useCallback(() => {}, [])
  const resume = useCallback(() => {}, [])
  const stop = useCallback(async () => {}, [])
  const cancel = useCallback(() => {}, [])
  const restart = useCallback(() => {}, [])
  const getElapsedTime = useCallback(() => 0, [])

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
