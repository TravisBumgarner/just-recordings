import Box from '@mui/material/Box'
import { ROUTES } from '../consts'
import Link from '../sharedComponents/Link'

import {
  SPACING,
} from '../styles/styleConsts'
import { TAB_HEIGHT } from '../styles/Theme'
import Navigation from './Navigation'
const Header = () => {
  return (
    <Box sx={WrapperSX}>
      <Link href={ROUTES.home.href()} hideBaseUnderline>
        <img
          src="/public/favicon.png"
          style={{
            width: TAB_HEIGHT,
            aspectRatio: '1 / 1',
            display: 'block',
          }}
        />
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
  marginBottom: SPACING.MEDIUM.PX,
  padding: `${SPACING.SMALL.PX} 0`,
}

export default Header
