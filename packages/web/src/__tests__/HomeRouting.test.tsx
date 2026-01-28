import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

// Mock the store
const mockAppUser = vi.fn()
vi.mock('../store', () => ({
  default: (selector: (state: { appUser: unknown }) => unknown) =>
    selector({ appUser: mockAppUser() }),
}))

// Mock lazy-loaded components to avoid complexity
vi.mock('../pages/Home.Web', () => ({
  default: () => <div data-testid="home-dashboard">Home Dashboard</div>,
}))

vi.mock('../pages/Home.Desktop', () => ({
  default: () => <div data-testid="home-dashboard">Home Dashboard</div>,
}))

vi.mock('../pages/LandingPage.Web', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}))

vi.mock('../pages/LandingPage.Desktop', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}))

// Mock recorder dependencies
vi.mock('@just-recordings/recorder', () => ({
  RecorderDatabase: vi.fn(),
  RecorderService: vi.fn(() => ({
    startScreenRecording: vi.fn(),
    stopRecording: vi.fn(),
    onStateChange: vi.fn(() => () => {}),
    onStreamEnded: vi.fn(() => () => {}),
    getState: vi.fn(() => 'idle'),
  })),
  UploadManager: vi.fn(() => ({
    initialize: vi.fn(),
    onQueueChange: vi.fn(() => () => {}),
    getQueue: vi.fn(() => Promise.resolve([])),
  })),
  createUploader: vi.fn(),
}))

// Mock createTokenGetter utility
vi.mock('../utils/createTokenGetter', () => ({
  createTokenGetter: vi.fn(() => vi.fn(() => Promise.resolve('mock-token'))),
}))

import Router from '../components/Router'

const renderRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Router isElectron={false} isChromeExtension={false} />
    </MemoryRouter>,
  )
}

describe('Home route routing', () => {
  describe('when user is not authenticated', () => {
    it('shows the landing page at /', async () => {
      mockAppUser.mockReturnValue(null)
      renderRouter('/')
      expect(await screen.findByTestId('landing-page')).toBeInTheDocument()
    })
  })

  describe('when user is authenticated', () => {
    it('shows the home dashboard at /', async () => {
      mockAppUser.mockReturnValue({
        id: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      })
      renderRouter('/')
      expect(await screen.findByTestId('home-dashboard')).toBeInTheDocument()
    })
  })
})
