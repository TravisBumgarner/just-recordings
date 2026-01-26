import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

export interface RecordingNameModalProps {
  open: boolean
  defaultName: string
  onSave: (name: string) => void
  onCancel: () => void
}

/**
 * Modal that prompts user to name a recording after it stops.
 * Pre-filled with a default name, user can accept or customize.
 */
export function RecordingNameModal({
  open,
  defaultName,
  onSave,
  onCancel,
}: RecordingNameModalProps) {
  const [name, setName] = useState(defaultName)

  // Reset name when modal opens with new defaultName
  useEffect(() => {
    if (open) {
      setName(defaultName)
    }
  }, [open, defaultName])

  const handleSave = () => {
    const trimmedName = name.trim()
    // Use default name if user cleared the input
    onSave(trimmedName || defaultName)
  }

  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onClose={onCancel} data-testid="recording-name-modal">
      <DialogTitle>Name Your Recording</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Recording Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          inputProps={{ 'data-testid': 'recording-name-input' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * Generate a default recording name with timestamp.
 * Format: "Recording Jan 26, 2026 2:30 PM"
 */
export function generateDefaultRecordingName(date: Date = new Date()): string {
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `Recording ${datePart} ${timePart}`
}
