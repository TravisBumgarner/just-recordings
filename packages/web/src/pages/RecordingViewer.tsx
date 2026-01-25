import { FaCheck, FaPencilAlt, FaTimes } from 'react-icons/fa'
import { IoMdShare } from 'react-icons/io'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ErrorAlert } from '@/components/ErrorAlert'
import { useDeleteRecording } from '@/hooks/mutations/useDeleteRecording'
import { useUpdateRecording } from '@/hooks/mutations/useUpdateRecording'
import { useVideoUrl } from '@/hooks/queries/useRecordingMedia'
import { useRecording } from '@/hooks/queries/useRecordings'
import { ApiError } from '@/lib/ApiError'
import { MODAL_ID } from '@/sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '@/signals'
import PageWrapper from '@/styles/shared/PageWrapper'
import { errorMessages } from '@just-recordings/shared'

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`
  }
  const kb = bytes / 1024
  return `${kb.toFixed(1)} KB`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function RecordingViewerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorOpen, setErrorOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')

  const { data: recording, isLoading, isError } = useRecording(id)
  const { data: videoUrl } = useVideoUrl(id)
  const deleteRecording = useDeleteRecording()
  const updateRecording = useUpdateRecording()

  const handleShareClick = () => {
    if (recording) {
      activeModalSignal.value = {
        id: MODAL_ID.SHARE_MODAL,
        recordingId: recording.id,
        recordingName: recording.name,
      }
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (recording?.id) {
      deleteRecording.mutate(recording.id, {
        onSuccess: () => {
          navigate('/')
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            setErrorMessage(errorMessages[error.errorCode])
          } else {
            setErrorMessage('An unexpected error occurred')
          }
          setErrorOpen(true)
        },
      })
    }
    setDeleteDialogOpen(false)
  }

  const clearError = () => {
    setErrorOpen(false)
    setErrorMessage(null)
  }

  const handleEditClick = () => {
    if (recording) {
      setEditedName(recording.name)
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedName('')
  }

  const handleSaveEdit = () => {
    if (recording && editedName.trim()) {
      updateRecording.mutate(
        { id: recording.id, name: editedName.trim() },
        {
          onSuccess: () => {
            setIsEditing(false)
          },
          onError: (error) => {
            if (error instanceof ApiError) {
              setErrorMessage(errorMessages[error.errorCode])
            } else {
              setErrorMessage('An unexpected error occurred')
            }
            setErrorOpen(true)
          },
        }
      )
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSaveEdit()
    } else if (event.key === 'Escape') {
      handleCancelEdit()
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
            data-testid="loading-indicator"
          >
            <CircularProgress />
          </Box>
        </Box>
      </Container>
    )
  }

  if (isError || !recording) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 4 }} data-testid="error-state">
            <Typography variant="h6" color="text.secondary">
              Recording not found
            </Typography>
            <Button component={Link} to="/" sx={{ mt: 2 }}>
              Back
            </Button>
          </Box>
        </Box>
      </Container>
    )
  }

  return (
    <PageWrapper width="full">
      <Box sx={{ py: 4 }}>
        <Button component={Link} to="/" sx={{ mb: 2 }}>
          Back
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {isEditing ? (
            <>
              <TextField
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                size="small"
                autoFocus
                disabled={updateRecording.isPending}
                inputProps={{ 'data-testid': 'name-input' }}
                sx={{ minWidth: 200 }}
              />
              {updateRecording.isPending ? (
                <CircularProgress size={24} data-testid="name-save-loading" />
              ) : (
                <>
                  <IconButton
                    onClick={handleSaveEdit}
                    color="primary"
                    size="small"
                    data-testid="save-name-button"
                  >
                    <FaCheck size={16} />
                  </IconButton>
                  <IconButton
                    onClick={handleCancelEdit}
                    size="small"
                    data-testid="cancel-name-button"
                  >
                    <FaTimes size={16} />
                  </IconButton>
                </>
              )}
            </>
          ) : (
            <>
              <Typography variant="h4" component="h1">
                {recording.name}
              </Typography>
              <IconButton
                onClick={handleEditClick}
                title="Edit name"
                size="small"
                data-testid="edit-name-button"
              >
                <FaPencilAlt size={16} />
              </IconButton>
              <IconButton
                onClick={handleShareClick}
                title="Share recording"
                data-testid="share-button"
              >
                <IoMdShare size={24} />
              </IconButton>
            </>
          )}
        </Box>

        {/* Video Player */}
        <Box sx={{ mb: 3 }}>
          {videoUrl && (
            <video
              data-testid="video-player"
              src={videoUrl}
              controls
              style={{ width: '100%', maxHeight: '70vh' }}
            >
              <track kind="captions" srcLang="en" label="English" />
            </video>
          )}
        </Box>

        {/* Metadata */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Duration: {formatDuration(recording.duration)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Created: {formatDate(recording.createdAt)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Size: {formatFileSize(recording.fileSize)}
          </Typography>
        </Box>

        {/* Delete Button */}
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteClick}
          disabled={deleteRecording.isPending}
        >
          {deleteRecording.isPending ? 'Deleting...' : 'Delete Recording'}
        </Button>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          data-testid="delete-confirmation"
        >
          <DialogTitle>Delete Recording?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{recording.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Confirm Delete
            </Button>
          </DialogActions>
        </Dialog>

        <ErrorAlert message={errorMessage} open={errorOpen} onClose={clearError} />
      </Box>
    </PageWrapper>
  )
}

export default RecordingViewerPage
