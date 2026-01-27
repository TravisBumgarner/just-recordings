import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TermsOfService from '../pages/TermsOfService'

const renderTermsOfService = () => {
  return render(<TermsOfService />)
}

describe('TermsOfService', () => {
  it('displays the page title', () => {
    renderTermsOfService()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
  })

  it('displays a last updated date', () => {
    renderTermsOfService()
    expect(screen.getByText(/last updated/i)).toBeInTheDocument()
  })

  it('does not display the placeholder text', () => {
    renderTermsOfService()
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
  })

  it('includes a section about acceptable use', () => {
    renderTermsOfService()
    expect(screen.getByText(/acceptable use/i)).toBeInTheDocument()
  })

  it('includes a section about user content', () => {
    renderTermsOfService()
    expect(screen.getByText(/user content/i)).toBeInTheDocument()
  })

  it('includes a section about limitation of liability', () => {
    renderTermsOfService()
    expect(screen.getByText(/limitation of liability/i)).toBeInTheDocument()
  })

  it('includes a section about termination', () => {
    renderTermsOfService()
    expect(screen.getByText(/termination/i)).toBeInTheDocument()
  })
})
