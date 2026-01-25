import { IoCopy } from 'react-icons/io5'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState } from 'react'
import type { RecordingShare, ShareType } from '@just-recordings/shared'
import { useCreateShare, useRevokeShare } from '../../../hooks/mutations/useShares'
import { useShares } from '../../../hooks/queries/useShares'
import { activeModalSignal } from '../../../signals'
import type { MODAL_ID } from '../Modal.consts'
import DefaultModal from './DefaultModal'

type AccessLevel = 'private' | 'link' | 'single_view'

export interface ShareModalProps {
  id: typeof MODAL_ID.SHARE_MODAL
  recordingId: string
  recordingName: string
}

const ShareModal = ({ recordingId, recordingName }: ShareModalProps) => {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('private')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const { data: shares, isLoading: sharesLoading } = useShares(recordingId)
  const createShare = useCreateShare()
  const revokeShare = useRevokeShare()

  // Find active share link
  const activeShare = shares?.find(
    (s) => s.isActive && (s.shareType === 'link' || s.shareType === 'single_view')
  )

  // Set initial access level based on existing shares
  useEffect(() => {
    if (activeShare) {
      setAccessLevel(activeShare.shareType as AccessLevel)
    }
  }, [activeShare])

  const handleAccessLevelChange = useCallback(
    async (newLevel: AccessLevel) => {
      setAccessLevel(newLevel)

      if (newLevel === 'private') {
        // Revoke all active shares
        if (activeShare) {
          await revokeShare.mutateAsync({
            recordingId,
            shareId: activeShare.id,
          })
          setSnackbarMessage('Share link revoked')
          setSnackbarOpen(true)
        }
      } else {
        // If we have an active share of a different type, revoke it first
        if (activeShare && activeShare.shareType !== newLevel) {
          await revokeShare.mutateAsync({
            recordingId,
            shareId: activeShare.id,
          })
        }

        // Create new share if we don't have an active one of this type
        if (!activeShare || activeShare.shareType !== newLevel) {
          await createShare.mutateAsync({
            recordingId,
            shareType: newLevel as ShareType,
          })
          setSnackbarMessage('Share link created')
          setSnackbarOpen(true)
        }
      }
    },
    [activeShare, recordingId, createShare, revokeShare]
  )

  const handleCopyLink = useCallback(() => {
    if (activeShare?.shareUrl) {
      navigator.clipboard.writeText(activeShare.shareUrl)
      setSnackbarMessage('Link copied to clipboard')
      setSnackbarOpen(true)
    }
  }, [activeShare])

  const handleRevokeShare = useCallback(
    async (share: RecordingShare) => {
      await revokeShare.mutateAsync({
        recordingId,
        shareId: share.id,
      })
      setAccessLevel('private')
      setSnackbarMessage('Share link revoked')
      setSnackbarOpen(true)
    },
    [recordingId, revokeShare]
  )

  const handleClose = useCallback(() => {
    activeModalSignal.value = null
  }, [])

  const isLoading = createShare.isPending || revokeShare.isPending || sharesLoading

  return (
    <DefaultModal closeCallback={handleClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">Share "{recordingName}"</Typography>

        <Typography variant="body2" color="text.secondary">
          Access Level:
        </Typography>

        <RadioGroup
          value={accessLevel}
          onChange={(e) => handleAccessLevelChange(e.target.value as AccessLevel)}
        >
          <FormControlLabel
            value="private"
            control={<Radio />}
            label="Just me (private)"
            disabled={isLoading}
          />
          <FormControlLabel
            value="link"
            control={<Radio />}
            label="Anybody with link"
            disabled={isLoading}
          />
          <FormControlLabel
            value="single_view"
            control={<Radio />}
            label="Single view (link expires after one view)"
            disabled={isLoading}
          />
        </RadioGroup>

        {accessLevel !== 'private' && activeShare?.shareUrl && (
          <>
            <Divider />
            <Typography variant="body2" color="text.secondary">
              Share Link:
            </Typography>
            <TextField
              fullWidth
              value={activeShare.shareUrl}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopyLink} edge="end" title="Copy link">
                      <IoCopy size={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </>
        )}

        {shares && shares.length > 0 && (
          <>
            <Divider />
            <Typography variant="body2" color="text.secondary">
              Share History:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {shares.map((share) => (
                <Box
                  key={share.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body2">
                      {share.shareType === 'link' ? 'Anybody with link' : 'Single view'}
                      {share.isActive ? '' : ' (inactive)'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {share.viewCount} view{share.viewCount !== 1 ? 's' : ''}
                      {share.revokedAt && ' - revoked'}
                      {share.maxViews && share.viewCount >= share.maxViews && ' - limit reached'}
                    </Typography>
                  </Box>
                  {share.isActive && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRevokeShare(share)}
                      disabled={isLoading}
                    >
                      Revoke
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          </>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </DefaultModal>
  )
}

export default ShareModal
