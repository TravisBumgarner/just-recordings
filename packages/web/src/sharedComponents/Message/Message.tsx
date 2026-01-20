import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { useTheme } from '@mui/material/styles'
import { useMemo } from 'react'
import { GiPartyPopper } from 'react-icons/gi'
import { IoMdWarning } from 'react-icons/io'
import { IoInformationCircleOutline } from 'react-icons/io5'
import { BORDER_RADIUS, FONT_SIZES, SPACING, subtleBackground } from '../../styles/styleConsts'

const Message = ({
  message,
  color,
  callback,
  callbackText,
  includeVerticalMargin,
}: {
  message: string
  color: 'info' | 'error' | 'success'
  callback?: () => void
  callbackText?: string
  includeVerticalMargin?: boolean
}) => {
  const theme = useTheme()

  const icon = useMemo(() => {
    if (color === 'error') {
      return <IoMdWarning size={FONT_SIZES.LARGE.PX} color={theme.palette.info.main} />
    }
    if (color === 'success') {
      return <GiPartyPopper size={FONT_SIZES.LARGE.PX} color={theme.palette.info.main} />
    }
    return <IoInformationCircleOutline size={FONT_SIZES.LARGE.PX} color={theme.palette.info.main} />
  }, [color, theme])

  return (
    <Box
      sx={{
        backgroundColor: subtleBackground(theme.palette.mode, 'slightly'),
        borderRadius: BORDER_RADIUS.ZERO.PX,
        padding: SPACING.MEDIUM.PX,
        margin: includeVerticalMargin ? `${SPACING.MEDIUM.PX} 0` : 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        gap: SPACING.MEDIUM.PX,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>{icon}</Box>
        <Typography sx={{ marginLeft: SPACING.SMALL.PX }} variant="h5" color={'info.main'}>
          {message}
        </Typography>
      </Box>
      {callback && (
        <Button variant="contained" color={color} onClick={callback}>
          {callbackText}
        </Button>
      )}
    </Box>
  )
}

export default Message
