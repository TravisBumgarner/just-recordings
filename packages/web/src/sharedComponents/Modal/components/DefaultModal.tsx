import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MUIModal from '@mui/material/Modal'
import type { SxProps } from '@mui/material/styles'
import { useCallback, type FC } from 'react'
import { IoMdClose } from 'react-icons/io'
import { activeModalSignal } from '../../../signals'
import { BORDER_RADIUS, SPACING, Z_INDICES } from '../../../styles/styleConsts'
interface ActiveModal {
  children: React.ReactNode | React.ReactNode[]
  closeCallback?: () => void
  sx?: SxProps
}

const Modal: FC<ActiveModal> = ({ children, closeCallback, sx }) => {
  const handleClose = useCallback(
    (_event: unknown, reason?: string) => {
      if (closeCallback) closeCallback()

      if (reason === 'backdropClick') return
      activeModalSignal.value = null
    },
    [closeCallback],
  )

  return (
    <MUIModal
      sx={{
        maxHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        zIndex: Z_INDICES.MODAL,
      }}
      open={activeModalSignal.value !== null}
      onClose={handleClose}
      disableRestoreFocus={true}
      disableEscapeKeyDown={true}
    >
      <Box
        sx={{
          width: '500px',
          maxWidth: '90%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          color: 'text.primary',
          padding: SPACING.MEDIUM.PX,
          borderRadius: BORDER_RADIUS.ZERO.PX,
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingBottom: SPACING.SMALL.PX,
          }}
        >
          <IconButton component="button" onClick={handleClose}>
            <IoMdClose size={24} />
          </IconButton>
        </Box>
        {children}
      </Box>
    </MUIModal>
  )
}

export default Modal
