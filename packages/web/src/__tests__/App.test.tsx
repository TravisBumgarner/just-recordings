import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

// Mock hooks and store
vi.mock('../hooks/useHealthCheck', () => ({
  default: () => ({ isLoading: false, isHealthy: true }),
}))

vi.mock('../hooks/useLoadUserIntoState', () => ({
  default: () => {},
}))

vi.mock('../store', () => ({
  default: (selector: (state: { loadingUser: boolean; appUser: unknown }) => unknown) =>
    selector({ loadingUser: false, appUser: null }),
}))

// Mock recorder dependencies
vi.mock('@just-recordings/recorder', () => ({
  RecorderDatabase: vi.fn(),
  RecorderService: vi.fn(),
  UploadManager: vi.fn(() => ({ initialize: vi.fn() })),
  createUploader: vi.fn(),
}))

import { App } from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    // App should render something visible
    expect(document.body).not.toBeEmptyDOMElement()
  })

  it('renders the landing page at root route for non-authenticated users', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    // Landing page has "Screen recording. Nothing more." tagline
    expect(screen.getByText(/nothing more/i)).toBeInTheDocument()
  })
})
