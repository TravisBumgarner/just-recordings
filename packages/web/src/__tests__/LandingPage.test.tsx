import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import LandingPage from '../pages/LandingPage'

const renderLandingPage = () => {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
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

    it('has sign up call-to-action buttons linking to signup', () => {
      renderLandingPage()
      const signUpButtons = screen.getAllByRole('link', { name: /sign up/i })
      expect(signUpButtons.length).toBeGreaterThan(0)
      expect(signUpButtons[0]).toHaveAttribute('href', '/signup')
    })
  })

  describe('Features section', () => {
    it('displays feature highlights', () => {
      renderLandingPage()
      // Section heading contains "Simple"
      expect(screen.getByRole('heading', { name: /simple by design/i })).toBeInTheDocument()
    })
  })

  describe('Pricing section', () => {
    it('displays free during beta messaging', () => {
      renderLandingPage()
      expect(screen.getByRole('heading', { name: /pricing/i })).toBeInTheDocument()
      expect(screen.getByText(/during beta/i)).toBeInTheDocument()
    })
  })
})
