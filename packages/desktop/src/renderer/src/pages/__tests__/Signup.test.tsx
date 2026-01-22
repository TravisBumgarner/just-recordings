import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the supabase service
vi.mock('../../services/supabase', () => ({
  signup: vi.fn(),
}))

// Mock the auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    authUser: null,
  })),
}))

import { signup } from '../../services/supabase'
import SignupPage from '../Signup'

const mockSignup = vi.mocked(signup)

const renderSignup = () => {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  )
}

describe('SignupPage', () => {
  beforeEach(() => {
    mockSignup.mockReset()
  })

  describe('rendering', () => {
    it('renders the signup heading', () => {
      renderSignup()
      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
    })

    it('renders email input field', () => {
      renderSignup()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })

    it('renders password input field', () => {
      renderSignup()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    })

    it('renders confirm password input field', () => {
      renderSignup()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      renderSignup()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('renders link to login page', () => {
      renderSignup()
      expect(screen.getByText(/log in/i)).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('shows error for invalid email format', async () => {
      const user = userEvent.setup()
      renderSignup()

      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument()
      })
    })

    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      renderSignup()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password123')
      await user.type(screen.getByLabelText(/confirm password/i), 'different123')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/passwords.*match/i)).toBeInTheDocument()
      })
    })

    it('shows error when password is too short', async () => {
      const user = userEvent.setup()
      renderSignup()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'short')
      await user.type(screen.getByLabelText(/confirm password/i), 'short')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/at least.*characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('signup flow', () => {
    it('calls signup with email and password on valid submit', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue({ success: true })
      renderSignup()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password1234')
      await user.type(screen.getByLabelText(/confirm password/i), 'password1234')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password1234',
        })
      })
    })

    it('shows confirmation message on successful signup', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue({ success: true })
      renderSignup()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password1234')
      await user.type(screen.getByLabelText(/confirm password/i), 'password1234')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      })
    })

    it('shows error message on signup failure', async () => {
      const user = userEvent.setup()
      mockSignup.mockResolvedValue({ success: false, error: 'Email already in use' })
      renderSignup()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^password$/i), 'password1234')
      await user.type(screen.getByLabelText(/confirm password/i), 'password1234')
      await user.click(screen.getByRole('button', { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByText(/email already in use/i)).toBeInTheDocument()
      })
    })
  })
})
