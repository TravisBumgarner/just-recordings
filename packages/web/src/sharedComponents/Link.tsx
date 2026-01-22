import Box from '@mui/material/Box'
import MuiLink from '@mui/material/Link'
import { type SxProps, useTheme } from '@mui/material/styles'
import merge from 'lodash/merge'
import { Link as RouterLink } from 'react-router-dom'
import { PALETTE } from '../styles/styleConsts'
import { isElectronCheck, openExternal } from '../utils/electron'

type Props = {
  href: string
  children: React.ReactNode
  hideHoverUnderline?: boolean
  hideBaseUnderline?: boolean
  target?: '_blank' | '_self'
  sx?: SxProps
  onClick?: () => void
}

const Link = ({
  href,
  children,
  hideHoverUnderline = false,
  hideBaseUnderline = false,
  target = '_self',
  onClick = undefined,
  sx,
}: Props) => {
  const isDark = useTheme().palette.mode === 'dark'
  const isExternal = target === '_blank' || /^https?:\/\//.test(href)
  const isElectron = isElectronCheck()

  // base styles for both link types
  const baseStyle = {
    color: isDark ? PALETTE.grayscale[100] : PALETTE.grayscale[900],
    textDecoration: hideBaseUnderline ? 'none' : 'underline',
    cursor: 'pointer',
    transition: 'text-decoration 0.2s',
  }

  // hover style for underline control
  const hoverStyle = hideHoverUnderline
    ? {
        textDecoration: 'none',
        color: isDark ? PALETTE.grayscale[0] : PALETTE.grayscale[1000],
      }
    : {
        textDecoration: 'underline',
        color: isDark ? PALETTE.grayscale[0] : PALETTE.grayscale[1000],
      }

  if (isExternal) {
    // In Electron, handle external links via IPC instead of default browser behavior
    if (isElectron) {
      const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        openExternal(href)
        onClick?.()
      }
      return (
        <MuiLink
          onClick={handleClick}
          href={href}
          sx={merge(baseStyle, { '&:hover': hoverStyle }, sx)}
        >
          {children}
        </MuiLink>
      )
    }

    return (
      <MuiLink
        onClick={onClick}
        href={href}
        target={target}
        sx={merge(baseStyle, { '&:hover': hoverStyle }, sx)}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {children}
      </MuiLink>
    )
  }

  return (
    <RouterLink onClick={onClick} to={href} style={baseStyle as React.CSSProperties}>
      <Box component="span" sx={merge({ '&:hover': hoverStyle }, sx)}>
        {children}
      </Box>
    </RouterLink>
  )
}

export default Link
