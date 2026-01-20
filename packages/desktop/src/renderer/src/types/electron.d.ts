export interface ElectronVersions {
  electron: string
  chrome: string
  node: string
}

export interface ElectronApi {
  getVersions: () => ElectronVersions
}

declare global {
  interface Window {
    api: ElectronApi
  }
}
