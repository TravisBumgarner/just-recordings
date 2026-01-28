import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import LandingPage from '../pages/LandingPage/Web'

const renderLandingPage = () => {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  describe('Hero section', () => {
    it('displays a tagline about simplicity', () => {
      renderLandingPage()
      expect(screen.getByText(/nothing more/i)).toBeInTheDocument()
    })
  })
})
