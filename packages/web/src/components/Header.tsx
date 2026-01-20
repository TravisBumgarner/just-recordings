import Box from '@mui/material/Box'
import { ROUTES } from '../consts'
import Link from '../sharedComponents/Link'

import { SPACING } from '../styles/styleConsts'

import Navigation from './Navigation'
import { Typography } from '@mui/material'

const Header = () => {
  return (
    <Box sx={WrapperSX}>
      <Link href={ROUTES.home.href()} hideBaseUnderline>
        <Typography variant="h1">Just Recordings</Typography>
      </Link>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: SPACING.SMALL.PX,
          alignItems: 'center',
        }}
      >
        <Navigation />
      </Box>
    </Box>
  )
}

const WrapperSX = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SPACING.SMALL.PX,
  padding: `${SPACING.SMALL.PX} 0`,
}

export default Header
