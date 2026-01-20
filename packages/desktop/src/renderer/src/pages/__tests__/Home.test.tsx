import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Home from '../Home'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('Home', () => {
  it('displays the app title', () => {
    renderWithRouter(<Home />)

    expect(screen.getByRole('heading', { name: /just recordings/i })).toBeInTheDocument()
  })

  it('displays a description', () => {
    renderWithRouter(<Home />)

    expect(screen.getByText(/desktop app for recording/i)).toBeInTheDocument()
  })

  it('has a Start Recording button that links to recording page', () => {
    renderWithRouter(<Home />)

    const button = screen.getByRole('link', { name: /start recording/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', '/recording')
  })
})
