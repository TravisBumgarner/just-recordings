import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useState } from 'react'

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

  // TODO: Implement modal UI
  return null
}

/**
 * Generate a default recording name with timestamp.
 * Format: "Recording Jan 26, 2026 2:30 PM"
 */
export function generateDefaultRecordingName(date: Date = new Date()): string {
  // TODO: Implement
  return ''
}
