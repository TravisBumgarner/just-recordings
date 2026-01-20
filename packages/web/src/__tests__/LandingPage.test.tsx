import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import LandingPage from '../pages/LandingPage'

const renderLandingPage = () => {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  )
}

describe('LandingPage', () => {
  describe('Hero section', () => {
    it('displays the app name', () => {
      renderLandingPage()
      expect(screen.getByText(/just recordings/i)).toBeInTheDocument()
    })

    it('displays a tagline about simplicity', () => {
      renderLandingPage()
      expect(screen.getByText(/nothing more/i)).toBeInTheDocument()
    })

    it('has a sign up call-to-action button', () => {
      renderLandingPage()
      const signUpButton = screen.getByRole('link', { name: /sign up/i })
      expect(signUpButton).toBeInTheDocument()
      expect(signUpButton).toHaveAttribute('href', '/signup')
    })
  })

  describe('Features section', () => {
    it('displays feature highlights', () => {
      renderLandingPage()
      // Should have at least 3 features
      expect(screen.getByText(/simple/i)).toBeInTheDocument()
    })
  })

  describe('Pricing section', () => {
    it('displays free during beta messaging', () => {
      renderLandingPage()
      expect(screen.getByText(/free/i)).toBeInTheDocument()
      expect(screen.getByText(/beta/i)).toBeInTheDocument()
    })
  })
})
