import { GiHamburgerMenu } from 'react-icons/gi'

import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'

import Divider from '@mui/material/Divider'
import { useCallback, useMemo, useState } from 'react'
import { ROUTES } from '../consts'
import Link from '../sharedComponents/Link'
import useGlobalStore from '../store'
import { BORDER_RADIUS } from '../styles/styleConsts'


type Items = (keyof typeof ROUTES | 'divider')[]

export const USER_ROUTES: Items = [
  'home',
  'settings',
  'logout',
]

export const ANON_ROUTES: Items = [
  'home',
  'login',
  'signup',
]


const DropdownLinks = ({ onClose }: { onClose: () => void }) => {
  const appUser = useGlobalStore((state) => state.appUser)

  const routeKeys = useMemo(() => {
    if (!appUser) return ANON_ROUTES

    return USER_ROUTES
  }, [appUser])
  return (
    <>
      {routeKeys.map((key, index) =>
        key === 'divider' ? (
          <Divider key={key + index} />
        ) : (
          <Link
            key={key}
            hideBaseUnderline
            hideHoverUnderline
            href={ROUTES[key].href()}
          >
            <MenuItem onClick={onClose}>{ROUTES[key].label}</MenuItem>
          </Link>
        )
      )}
    </>
  )
}

const Navigation = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  return (
    <>
      <Tooltip title="Menu">
        <IconButton
          aria-label="menu"
          aria-controls={open ? 'navigation-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <GiHamburgerMenu />
        </IconButton>
      </Tooltip>
      <Menu
        slotProps={{ paper: { sx: { borderRadius: BORDER_RADIUS.ZERO.PX } } }}
        id="navigation-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <DropdownLinks onClose={handleClose} />
      </Menu>
    </>
  )
}

export default Navigation
