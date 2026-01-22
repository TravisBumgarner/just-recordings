import '@testing-library/jest-dom'

// Polyfill for HTMLFormElement.requestSubmit which is not implemented in jsdom
HTMLFormElement.prototype.requestSubmit = function () {
  const submitEvent = new Event('submit', {
    bubbles: true,
    cancelable: true,
  })
  this.dispatchEvent(submitEvent)
}

// Mock window.api for Electron preload APIs
Object.defineProperty(window, 'api', {
  value: {
    getVersions: () => ({ electron: '28.0.0', chrome: '120.0.0', node: '18.0.0' }),
    setRecordingState: () => {},
  },
  writable: true,
})
