import '@testing-library/jest-dom'

// Mock window.api for Electron preload APIs
Object.defineProperty(window, 'api', {
  value: {
    getVersions: () => ({ electron: '28.0.0', chrome: '120.0.0', node: '18.0.0' }),
    setRecordingState: () => {},
  },
  writable: true,
})
