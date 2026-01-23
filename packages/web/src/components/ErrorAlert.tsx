import { Alert, Snackbar } from '@mui/material'

interface ErrorAlertProps {
  message: string | null
  open: boolean
  onClose: () => void
}

export function ErrorAlert({ message, open, onClose }: ErrorAlertProps) {
  return (
    <Snackbar open={open} onClose={onClose}>
      <Alert severity="error" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  )
}
