import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import type React from 'react'
import { useCallback, useMemo } from 'react'
import { GrFormNext, GrFormPrevious } from 'react-icons/gr'
import { PAGINATION_SIZE } from '../consts'
import { SPACING } from '@just-recordings/shared/styles'

interface PaginationProps {
  total: number
  currentPage: number
  onPageChange: (page: number) => void
}

const PageNumber = ({
  page,
  isActive,
  handlePage,
}: {
  page: number
  isActive: boolean
  handlePage: (page: number) => void
}) => {
  const handleOnClick = useCallback(() => {
    handlePage(page)
  }, [handlePage, page])

  return (
    <Button
      variant={isActive ? 'contained' : 'text'}
      onClick={handleOnClick}
      size="small"
      sx={{
        fontWeight: isActive ? 'bold' : 'normal',
        padding: `${SPACING.TINY.PX} ${SPACING.SMALL.PX}`,
        minWidth: 'auto',
      }}
    >
      {page}
    </Button>
  )
}

const Pagination: React.FC<PaginationProps> = ({ total, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(total / PAGINATION_SIZE)

  const handlePrev = useCallback(() => {
    if (currentPage > 1) {
      onPageChange?.(currentPage - 1)
    }
  }, [currentPage, onPageChange])

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange?.(currentPage + 1)
    }
  }, [currentPage, onPageChange, totalPages])

  const handlePage = useCallback(
    (page: number) => {
      onPageChange?.(page)
    },
    [onPageChange],
  )

  // Show up to 5 page numbers, with ellipsis if needed
  const pageNumbers = useMemo(() => {
    const pages = []
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, currentPage + 2)
    if (currentPage <= 3) end = Math.min(5, totalPages)
    if (currentPage >= totalPages - 2) start = Math.max(1, totalPages - 4)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }, [currentPage, totalPages])

  return (
    <div
      style={{
        display: 'flex',
        gap: SPACING.SMALL.PX,
        alignItems: 'center',
        justifyContent: 'center',
        margin: `${SPACING.MEDIUM.PX} 0`,
      }}
    >
      <IconButton size="small" onClick={handlePrev} disabled={currentPage === 1}>
        <GrFormPrevious />
      </IconButton>
      {pageNumbers[0] > 1 && <span>...</span>}
      {pageNumbers.map((page) => (
        <PageNumber
          key={page}
          page={page}
          isActive={page === currentPage}
          handlePage={handlePage}
        />
      ))}
      {pageNumbers[pageNumbers.length - 1] < totalPages && <span>...</span>}
      <IconButton size="small" onClick={handleNext} disabled={currentPage === totalPages}>
        <GrFormNext />
      </IconButton>
    </div>
  )
}

export default Pagination
