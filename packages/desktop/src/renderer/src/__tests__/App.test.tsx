import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

// Mock the API service
vi.mock('../services/api', () => ({
  checkHealth: vi.fn().mockResolvedValue({ status: 'ok' }),
}))

describe('App', () => {
  beforeEach(() => {
    ;(window as any).api = {
      getVersions: vi.fn().mockReturnValue({
        electron: '28.0.0',
        chrome: '120.0.0',
        node: '18.18.0',
      }),
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
    delete (window as any).api
  })

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    // App should render something visible
    expect(document.body).not.toBeEmptyDOMElement()
  })

  it('renders the home page at root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText(/just recordings/i)).toBeInTheDocument()
  })
})
