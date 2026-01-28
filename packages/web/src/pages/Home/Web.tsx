import type { RecorderService, Recording, UploadManager } from '@just-recordings/recorder'
import type { Recording as ApiRecording } from '@just-recordings/shared'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  TextField,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaEllipsisV } from 'react-icons/fa'
import { Link, useSearchParams } from 'react-router-dom'
import { useDeleteRecording } from '@/hooks/mutations/useDeleteRecording'
import { useUpdateRecording } from '@/hooks/mutations/useUpdateRecording'
import { useThumbnailUrl } from '@/hooks/queries/useRecordingMedia'
import { useRecordings } from '@/hooks/queries/useRecordings'
import { queryKeys } from '@/lib/queryKeys'
import { MODAL_ID } from '@/sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '@/signals'
import PageWrapper from '@/styles/shared/PageWrapper'
import { CountdownOverlay } from '../../components/CountdownOverlay'
import { RecordingControlsModal } from '../../components/RecordingControlsModal'
import { generateDefaultRecordingName, RecordingNameModal } from '../../components/RecordingNameModal'
import { RecordingSettingsModal } from '../../components/RecordingSettingsModal'
import { type RecordingSettings, useRecordingFlow } from '../../hooks/useRecordingFlow'
import { setRecordingState } from '../../utils/electron'

export interface HomeProps {
  recorderService: RecorderService
  uploadManager: UploadManager
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function RecordingCard({ recording }: { recording: ApiRecording }) {
  const { data: thumbnailUrl, isLoading: thumbnailLoading } = useThumbnailUrl(
    recording.id,
    !!recording.thumbnailUrl,
  )

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editedName, setEditedName] = useState(recording.name)

  const deleteRecording = useDeleteRecording()
  const updateRecording = useUpdateRecording()

  const menuOpen = Boolean(menuAnchorEl)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleShareClick = () => {
    handleMenuClose()
    activeModalSignal.value = {
      id: MODAL_ID.SHARE_MODAL,
      recordingId: recording.id,
      recordingName: recording.name,
    }
  }

  const handleEditTitleClick = () => {
    handleMenuClose()
    setEditedName(recording.name)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = () => {
    handleMenuClose()
    setDeleteDialogOpen(true)
  }

  const handleEditSave = () => {
    if (editedName.trim()) {
      updateRecording.mutate(
        { id: recording.id, name: editedName.trim() },
        {
          onSuccess: () => {
            setEditDialogOpen(false)
          },
        },
      )
    }
  }

  const handleEditCancel = () => {
    setEditDialogOpen(false)
    setEditedName(recording.name)
  }

  const handleDeleteConfirm = () => {
    deleteRecording.mutate(recording.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
      },
    })
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card sx={{ position: 'relative' }}>
        <CardActionArea
          component={Link}
          to={`/recordings/${recording.id}`}
          aria-label={recording.name}
        >
          {thumbnailLoading ? (
            <Box
              sx={{
                height: 180,
                bgcolor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={40} />
            </Box>
          ) : thumbnailUrl ? (
            <CardMedia
              component="img"
              height="180"
              image={thumbnailUrl}
              alt={recording.name}
              sx={{
                bgcolor: 'grey.300',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                height: 180,
                bgcolor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No thumbnail
              </Typography>
            </Box>
          )}
          <CardContent>
            <Typography variant="h6" component="h2" noWrap>
              {recording.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDuration(recording.duration)} &bull; {formatDate(recording.createdAt)}
            </Typography>
          </CardContent>
        </CardActionArea>

        {/* Menu Button */}
        <IconButton
          data-testid={`recording-card-menu-button-${recording.id}`}
          onClick={handleMenuClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
          size="small"
        >
          <FaEllipsisV size={14} />
        </IconButton>

        {/* Dropdown Menu */}
        <Menu
          data-testid={`recording-card-menu-${recording.id}`}
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleShareClick}>
            <ListItemText>Share</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditTitleClick}>
            <ListItemText>Edit Title</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Edit Title Dialog */}
        <Dialog open={editDialogOpen} onClose={handleEditCancel} data-testid="edit-title-dialog">
          <DialogTitle>Edit Recording Title</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              type="text"
              fullWidth
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              inputProps={{ 'data-testid': 'edit-title-input' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditCancel}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={updateRecording.isPending}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          data-testid="delete-confirmation-dialog"
        >
          <DialogTitle>Delete Recording?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{recording.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              disabled={deleteRecording.isPending}
            >
              Confirm Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Grid>
  )
}

const PAGE_SIZE = 20

function Home({ recorderService, uploadManager }: HomeProps) {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  // Get page from URL, default to 1
  const currentPage = Number(searchParams.get('page')) || 1

  const { data, isLoading, isError, isFetching } = useRecordings({
    page: currentPage,
    limit: PAGE_SIZE,
  })

  const recordings = data?.recordings ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setSearchParams({ page: String(page) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [queue, setQueue] = useState<Recording[]>([])
  const previousQueueRef = useRef<Recording[]>([])

  // Handle recording saved - enqueue for upload (if enabled) and update tray icon
  const handleRecordingSaved = useCallback(
    async (recording: Recording, settings: RecordingSettings) => {
      setRecordingState(false)
      // Only enqueue for upload if auto-upload is enabled (defaults to true)
      if (settings.autoUpload !== false) {
        await uploadManager.enqueue(recording)
      }
    },
    [uploadManager],
  )

  // Use the recording flow hook
  const {
    flowState,
    recorderState,
    pendingRecording,
    openSettings,
    closeSettings,
    startWithSettings,
    onCountdownComplete,
    pause,
    resume,
    stop,
    cancel,
    restart,
    finishWithName,
    getElapsedTime,
  } = useRecordingFlow({
    recorderService,
    onRecordingSaved: handleRecordingSaved,
  })

  // Track previous flowState to detect transitions
  const prevFlowStateRef = useRef(flowState)
  useEffect(() => {
    // When transitioning to 'recording', update tray icon
    if (prevFlowStateRef.current === 'countdown' && flowState === 'recording') {
      setRecordingState(true)
    }
    // When cancelling (recording -> idle), update tray icon
    if (prevFlowStateRef.current === 'recording' && flowState === 'idle') {
      setRecordingState(false)
    }
    prevFlowStateRef.current = flowState
  }, [flowState])

  useEffect(() => {
    // Fetch initial queue state
    uploadManager.getQueue().then(setQueue)

    // Subscribe to queue changes and detect completed uploads
    const unsubscribe = uploadManager.onQueueChange((newQueue) => {
      const prevQueue = previousQueueRef.current

      // Find recordings that were uploading but are now gone (completed)
      const completedUploads = prevQueue.filter(
        (prev) =>
          prev.uploadStatus === 'uploading' && !newQueue.some((curr) => curr.id === prev.id),
      )

      // If any uploads completed, invalidate recordings list
      if (completedUploads.length > 0) {
        queryClient.invalidateQueries({ queryKey: queryKeys.recordings })
      }

      previousQueueRef.current = newQueue
      setQueue(newQueue)
    })

    return unsubscribe
  }, [uploadManager, queryClient])

  const handleRetry = useCallback(
    (id: number) => {
      uploadManager.retry(id)
    },
    [uploadManager],
  )

  const handleCancel = useCallback(
    (id: number) => {
      uploadManager.cancel(id)
    },
    [uploadManager],
  )

  const getStatusColor = (status: Recording['uploadStatus']): 'default' | 'primary' | 'error' => {
    switch (status) {
      case 'pending':
        return 'default'
      case 'uploading':
        return 'primary'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <PageWrapper width="full">
      {/* Recording Settings Modal */}
      <RecordingSettingsModal
        open={flowState === 'settings'}
        onClose={closeSettings}
        onStartRecording={startWithSettings}
      />

      {/* Countdown Overlay */}
      {flowState === 'countdown' && (
        <CountdownOverlay seconds={3} onComplete={onCountdownComplete} />
      )}

      {/* Recording Controls Modal */}
      <RecordingControlsModal
        open={flowState === 'recording'}
        recorderState={recorderState}
        getElapsedTime={getElapsedTime}
        onStop={stop}
        onPause={pause}
        onResume={resume}
        onRestart={restart}
        onCancel={cancel}
      />

      {/* Recording Name Modal */}
      <RecordingNameModal
        open={flowState === 'naming'}
        defaultName={generateDefaultRecordingName(pendingRecording?.createdAt)}
        onSave={finishWithName}
        onCancel={() => {
          // Cancel uses default name
          finishWithName(generateDefaultRecordingName(pendingRecording?.createdAt))
        }}
      />

      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
          {flowState === 'idle' && (
            <Button variant="contained" color="primary" size="large" onClick={openSettings}>
              Start Recording
            </Button>
          )}
        </Box>

        {queue.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upload Queue ({queue.length})
            </Typography>
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
              {queue.map((recording) => (
                <ListItem
                  key={recording.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1">{recording.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={recording.uploadStatus}
                          size="small"
                          color={getStatusColor(recording.uploadStatus)}
                        />
                        {recording.uploadStatus === 'uploading' &&
                          recording.uploadProgress !== undefined && (
                            <Typography variant="body2" color="text.secondary">
                              {Math.round(recording.uploadProgress)}%
                            </Typography>
                          )}
                        {recording.uploadStatus === 'failed' && recording.uploadError && (
                          <Typography variant="body2" color="error">
                            {recording.uploadError}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {recording.uploadStatus === 'failed' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleRetry(recording.id!)}
                        >
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleCancel(recording.id!)}
                      >
                        {recording.uploadStatus === 'uploading' ? 'Cancel' : 'Delete'}
                      </Button>
                    </Box>
                  </Box>
                  {recording.uploadStatus === 'uploading' && (
                    <LinearProgress
                      variant="determinate"
                      value={recording.uploadProgress || 0}
                      sx={{ mt: 1, width: '100%' }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {isLoading && (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
            data-testid="loading-indicator"
          >
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Box sx={{ textAlign: 'center', py: 4 }} data-testid="error-state">
            <Typography variant="h6" color="text.secondary">
              Failed to load recordings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please try again later.
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && recordings.length === 0 && total === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }} data-testid="empty-state">
            <Typography variant="h6" color="text.secondary">
              No recordings yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start recording to see your videos here.
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && recordings.length > 0 && (
          <Box sx={{ position: 'relative' }}>
            {/* Loading overlay for page transitions */}
            {isFetching && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
                data-testid="page-loading-overlay"
              >
                <CircularProgress />
              </Box>
            )}

            <Grid container spacing={3}>
              {recordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </Grid>

            {/* Pagination controls */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 0,
                    border: '1px solid',
                    borderColor: 'text.primary',
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'text.primary',
                      color: 'background.default',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'text.primary',
                      color: 'background.default',
                      '&:hover': {
                        backgroundColor: 'text.primary',
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </PageWrapper>
  )
}

export default Home
