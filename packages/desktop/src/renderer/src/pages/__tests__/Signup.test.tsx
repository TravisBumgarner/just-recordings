import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
      renderSignup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      fireEvent.submit(emailInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument()
      })
    })

    it('shows error when passwords do not match', async () => {
      renderSignup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password1234' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'different1234' } })
      fireEvent.submit(emailInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/passwords.*match/i)).toBeInTheDocument()
      })
    })

    it('shows error when password is too short', async () => {
      renderSignup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'short' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } })
      fireEvent.submit(emailInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/at least.*characters/i)).toBeInTheDocument()
      })
    })
  })

  describe('signup flow', () => {
    it('calls signup with email and password on valid submit', async () => {
      mockSignup.mockResolvedValue({ success: true })
      renderSignup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password1234' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password1234' } })
      fireEvent.submit(emailInput.closest('form')!)

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password1234',
        })
      })
    })

    it('shows confirmation message on successful signup', async () => {
      mockSignup.mockResolvedValue({ success: true })
      renderSignup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password1234' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password1234' } })
      fireEvent.submit(emailInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      })
    })

    it('shows error message on signup failure', async () => {
      mockSignup.mockResolvedValue({ success: false, error: 'Email already in use' })
      renderSignup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password1234' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password1234' } })
      fireEvent.submit(emailInput.closest('form')!)

      await waitFor(() => {
        expect(screen.getByText(/email already in use/i)).toBeInTheDocument()
      })
    })
  })
})
