import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ComparisonTable } from '../components/ComparisonTable'

const renderComparisonTable = () => {
  return render(<ComparisonTable />)
}

describe('ComparisonTable', () => {
  describe('table structure', () => {
    it('renders a table element for accessibility', () => {
      renderComparisonTable()
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('has column headers for Just Recordings and competitors', () => {
      renderComparisonTable()
      const headers = screen.getAllByRole('columnheader')
      const headerTexts = headers.map((h) => h.textContent)

      expect(headerTexts).toContain('Just Recordings')
      // Should have at least one competitor column
      expect(headers.length).toBeGreaterThanOrEqual(2)
    })

    it('has row headers for features', () => {
      renderComparisonTable()
      const rowHeaders = screen.getAllByRole('rowheader')

      // Should have feature rows
      expect(rowHeaders.length).toBeGreaterThan(0)
    })
  })

  describe('features displayed', () => {
    it('includes local recording as a feature', () => {
      renderComparisonTable()
      expect(screen.getByText(/local recording/i)).toBeInTheDocument()
    })

    it('includes cloud storage as a feature', () => {
      renderComparisonTable()
      expect(screen.getByText(/cloud storage/i)).toBeInTheDocument()
    })

    it('includes sharing capability as a feature', () => {
      renderComparisonTable()
      expect(screen.getByText(/share/i)).toBeInTheDocument()
    })
  })

  describe('local recording highlight', () => {
    it('prominently displays that local recording is free', () => {
      renderComparisonTable()
      // Should have prominent text about local recording being free
      expect(screen.getByText(/local recording is always free/i)).toBeInTheDocument()
    })
  })

  describe('pricing row', () => {
    it('has a price row in the table', () => {
      renderComparisonTable()
      expect(screen.getByText(/price/i)).toBeInTheDocument()
    })
  })
})
