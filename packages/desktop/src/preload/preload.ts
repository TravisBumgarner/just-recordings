import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Import channel names for type safety
const FLOATING_WINDOW_CHANNELS = {
  SHOW: 'show-floating-controls',
  HIDE: 'hide-floating-controls',
  UPDATE_RECORDING_STATE: 'update-recording-state',
  CONTROL_ACTION: 'floating-control-action',
} as const

const COUNTDOWN_CHANNELS = {
  START: 'countdown:start',
  TICK: 'countdown:tick',
  END: 'countdown:end',
} as const

// Type definitions for floating window communication
interface RecordingState {
  status: 'recording' | 'paused'
  elapsedTimeMs: number
  webcamEnabled: boolean
}

type FloatingControlAction = 'stop' | 'pause' | 'resume' | 'cancel'

// Type definitions for countdown communication
interface CountdownState {
  totalSeconds: number
  secondsRemaining: number
}

// Custom APIs for renderer
const api = {
  getVersions: () => ({
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  }),
  setRecordingState: (isRecording: boolean) => {
    ipcRenderer.send('recording-state-changed', isRecording)
  },
  setSetupMode: (enabled: boolean) => {
    ipcRenderer.send('set-setup-mode', enabled)
  },
  openExternal: (url: string) => {
    ipcRenderer.send('open-external', url)
  },
  openSystemPreferences: (panel: 'screenRecording' | 'microphone' | 'camera') => {
    ipcRenderer.send('open-system-preferences', panel)
  },

  // Floating window APIs
  showFloatingControls: () => {
    ipcRenderer.send(FLOATING_WINDOW_CHANNELS.SHOW)
  },
  hideFloatingControls: () => {
    ipcRenderer.send(FLOATING_WINDOW_CHANNELS.HIDE)
  },
  updateRecordingState: (state: RecordingState) => {
    ipcRenderer.send(FLOATING_WINDOW_CHANNELS.UPDATE_RECORDING_STATE, state)
  },
  sendFloatingControlAction: (action: FloatingControlAction) => {
    ipcRenderer.send(FLOATING_WINDOW_CHANNELS.CONTROL_ACTION, action)
  },
  onRecordingStateUpdate: (callback: (state: RecordingState) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: RecordingState) => {
      callback(state)
    }
    ipcRenderer.on(FLOATING_WINDOW_CHANNELS.UPDATE_RECORDING_STATE, handler)
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(FLOATING_WINDOW_CHANNELS.UPDATE_RECORDING_STATE, handler)
    }
  },
  onFloatingControlAction: (callback: (action: FloatingControlAction) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: FloatingControlAction) => {
      callback(action)
    }
    ipcRenderer.on(FLOATING_WINDOW_CHANNELS.CONTROL_ACTION, handler)
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(FLOATING_WINDOW_CHANNELS.CONTROL_ACTION, handler)
    }
  },

  // Countdown APIs
  countdownStart: (state: CountdownState) => {
    ipcRenderer.send(COUNTDOWN_CHANNELS.START, state)
  },
  countdownTick: (state: CountdownState) => {
    ipcRenderer.send(COUNTDOWN_CHANNELS.TICK, state)
  },
  countdownEnd: () => {
    ipcRenderer.send(COUNTDOWN_CHANNELS.END)
  },
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Preload context fallback
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
}
