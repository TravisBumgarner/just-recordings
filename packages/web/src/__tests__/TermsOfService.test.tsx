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
})
