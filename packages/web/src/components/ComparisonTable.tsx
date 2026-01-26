import { Box, Typography } from '@mui/material'
import { FaCheck, FaMinus } from 'react-icons/fa'
import { SPACING } from '../styles/styleConsts'

export interface ComparisonTableProps {
  /** Optional className for styling */
  className?: string
}

type FeatureSupport = 'yes' | 'no' | 'partial' | 'paid'

interface Feature {
  name: string
  justRecordings: FeatureSupport
  competitors: FeatureSupport
}

const features: Feature[] = [
  { name: 'Local recording', justRecordings: 'yes', competitors: 'no' },
  { name: 'Cloud storage', justRecordings: 'yes', competitors: 'yes' },
  { name: 'Share with a link', justRecordings: 'yes', competitors: 'yes' },
  { name: 'No account required', justRecordings: 'yes', competitors: 'no' },
  { name: 'Desktop app', justRecordings: 'yes', competitors: 'partial' },
  { name: 'Browser recording', justRecordings: 'yes', competitors: 'yes' },
]

function FeatureCell({ support }: { support: FeatureSupport }) {
  switch (support) {
    case 'yes':
      return <FaCheck aria-label="Yes" style={{ color: 'green' }} />
    case 'no':
      return <FaMinus aria-label="No" style={{ color: 'gray' }} />
    case 'partial':
      return <span>Some</span>
    case 'paid':
      return <span>Paid</span>
  }
}

/**
 * A comparison table showing Just Recordings features vs competitors.
 * Highlights that local recording is always free.
 */
export function ComparisonTable({ className }: ComparisonTableProps) {
  const cellStyles = {
    padding: SPACING.SMALL.PX,
    textAlign: 'center' as const,
    borderBottom: '1px solid',
    borderColor: 'divider',
  }

  const headerCellStyles = {
    ...cellStyles,
    fontWeight: 600,
    backgroundColor: 'action.hover',
  }

  return (
    <Box className={className} data-testid="comparison-table">
      {/* Highlight banner */}
      <Typography
        variant="h6"
        sx={{
          textAlign: 'center',
          mb: SPACING.MEDIUM.INT / 8,
          fontWeight: 600,
          color: 'success.main',
        }}
      >
        Local recording is always free
      </Typography>

      {/* Responsive table container */}
      <Box sx={{ overflowX: 'auto' }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '400px',
          }}
        >
          <thead>
            <tr>
              <Box component="th" scope="col" sx={{ ...headerCellStyles, textAlign: 'left' }}>
                Feature
              </Box>
              <Box component="th" scope="col" sx={headerCellStyles}>
                Just Recordings
              </Box>
              <Box component="th" scope="col" sx={headerCellStyles}>
                Others
              </Box>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.name}>
                <Box component="th" scope="row" sx={{ ...cellStyles, textAlign: 'left', fontWeight: 500 }}>
                  {feature.name}
                </Box>
                <Box component="td" sx={cellStyles}>
                  <FeatureCell support={feature.justRecordings} />
                </Box>
                <Box component="td" sx={cellStyles}>
                  <FeatureCell support={feature.competitors} />
                </Box>
              </tr>
            ))}
            {/* Price row */}
            <tr>
              <Box component="th" scope="row" sx={{ ...cellStyles, textAlign: 'left', fontWeight: 500 }}>
                Price
              </Box>
              <Box component="td" sx={{ ...cellStyles, color: 'success.main', fontWeight: 600 }}>
                Free
              </Box>
              <Box component="td" sx={cellStyles}>
                {/* Left empty as per requirements */}
              </Box>
            </tr>
          </tbody>
        </Box>
      </Box>
    </Box>
  )
}
