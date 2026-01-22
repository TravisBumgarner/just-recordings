import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the supabase service
vi.mock('../../services/supabase', () => ({
  login: vi.fn(),
}))

// Mock the auth store
vi.mock('../../stores/authStore', () => ({
  loadUserIntoState: vi.fn(),
  useAuthStore: vi.fn(() => ({
    authUser: null,
  })),
}))

import { login } from '../../services/supabase'
import { loadUserIntoState } from '../../stores/authStore'
import LoginPage from '../Login'

const mockLogin = vi.mocked(login)
const mockLoadUserIntoState = vi.mocked(loadUserIntoState)

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockLoadUserIntoState.mockReset()
  })

  describe('rendering', () => {
    it('renders the login heading', () => {
      renderLogin()
      expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument()
    })

    it('renders email input field', () => {
      renderLogin()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('renders password input field', () => {
      renderLogin()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      renderLogin()
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('renders link to signup page', () => {
      renderLogin()
      expect(screen.getByText(/sign up/i)).toBeInTheDocument()
    })

    it('renders link to password reset page', () => {
      renderLogin()
      expect(screen.getByText(/forgot.*password/i)).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows error for invalid email format', async () => {
      const user = userEvent.setup()
      renderLogin()

      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument()
      })
    })
  })

  describe('login flow', () => {
    it('calls login with email and password on submit', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ success: true })
      mockLoadUserIntoState.mockResolvedValue()
      renderLogin()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('loads user into state on successful login', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ success: true })
      mockLoadUserIntoState.mockResolvedValue()
      renderLogin()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(mockLoadUserIntoState).toHaveBeenCalled()
      })
    })

    it('shows error message on login failure', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' })
      renderLogin()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })
  })
})
