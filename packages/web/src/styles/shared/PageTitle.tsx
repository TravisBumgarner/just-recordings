import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/material/styles'

import { SPACING } from '../styleConsts'

const PageTitle = ({
  text,
  marginBottom,
  center,
  sx,
}: {
  text: string
  marginBottom?: boolean
  center?: boolean
  sx?: SxProps
}) => {
  return (
    <Typography
      variant="h2"
      sx={{
        marginBottom: marginBottom ? SPACING.MEDIUM.PX : '0px',
        textAlign: center ? 'center' : 'left',
        ...(sx ? sx : {}),
      }}
    >
      {text}
    </Typography>
  )
}

export default PageTitle
