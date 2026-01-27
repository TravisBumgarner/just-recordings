import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PrivacyPolicy from '../pages/PrivacyPolicy'

const renderPrivacyPolicy = () => {
  return render(<PrivacyPolicy />)
}

describe('PrivacyPolicy', () => {
  it('displays the page title', () => {
    renderPrivacyPolicy()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })

  it('displays a last updated date', () => {
    renderPrivacyPolicy()
    expect(screen.getByText(/last updated/i)).toBeInTheDocument()
  })

  it('does not display placeholder text', () => {
    renderPrivacyPolicy()
    expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument()
  })

  it('includes a section about data collection', () => {
    renderPrivacyPolicy()
    expect(screen.getByText(/data we collect/i)).toBeInTheDocument()
  })

  it('includes a section about recording storage', () => {
    renderPrivacyPolicy()
    expect(screen.getByText(/recording storage/i)).toBeInTheDocument()
  })

  it('includes a section about third-party services', () => {
    renderPrivacyPolicy()
    expect(screen.getByText(/third-party services/i)).toBeInTheDocument()
  })

  it('includes a section about data retention', () => {
    renderPrivacyPolicy()
    expect(screen.getByText(/data retention/i)).toBeInTheDocument()
  })

  it('includes a section about user rights', () => {
    renderPrivacyPolicy()
    expect(screen.getByText(/your rights/i)).toBeInTheDocument()
  })

  it('includes a section about cookies', () => {
    renderPrivacyPolicy()
    expect(screen.getByText(/cookies/i)).toBeInTheDocument()
  })

  it("includes a section about children's privacy", () => {
    renderPrivacyPolicy()
    expect(screen.getByText(/children/i)).toBeInTheDocument()
  })
})
