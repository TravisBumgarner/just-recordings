export interface ElectronVersions {
  electron: string
  chrome: string
  node: string
}

export interface ElectronApi {
  getVersions: () => ElectronVersions
  setRecordingState: (isRecording: boolean) => void
}

declare global {
  interface Window {
    api: ElectronApi
  }
}
