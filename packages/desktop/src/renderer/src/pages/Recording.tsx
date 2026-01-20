import { Box, Button, Container, LinearProgress, Typography, Alert } from '@mui/material'
import { useState, useEffect, useCallback } from 'react'
import type {
  RecorderService,
  RecorderState,
  Uploader,
} from '@just-recordings/recorder'
import { chunkBlob } from '@just-recordings/recorder'

export interface RecordingPageProps {
  recorderService: RecorderService
  uploader: Uploader
}

export interface UploadState {
  uploading: boolean
  progress: number
  totalChunks: number
  uploadedChunks: number
}

export type FeedbackState =
  | { type: 'none' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

function RecordingPage({ recorderService, uploader }: RecordingPageProps) {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    totalChunks: 0,
    uploadedChunks: 0,
  })
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'none' })

  useEffect(() => {
    const unsubscribe = recorderService.onStateChange(setRecorderState)
    return unsubscribe
  }, [recorderService])

  const handleStartRecording = useCallback(async () => {
    setFeedback({ type: 'none' })
    await recorderService.startScreenRecording()
  }, [recorderService])

  const handleStopRecording = useCallback(async () => {
    try {
      // Stop recording and get the recording data
      const recording = await recorderService.stopRecording()

      // Start upload
      const uploadId = await uploader.startUpload()

      // Chunk the blob
      const chunks = chunkBlob(recording.blob)
      const totalChunks = chunks.length

      setUploadState({
        uploading: true,
        progress: 0,
        totalChunks,
        uploadedChunks: 0,
      })

      // Upload each chunk
      for (let i = 0; i < chunks.length; i++) {
        await uploader.uploadChunk(uploadId, chunks[i], i)
        setUploadState((prev) => ({
          ...prev,
          uploadedChunks: i + 1,
          progress: ((i + 1) / totalChunks) * 100,
        }))
      }

      // Finalize upload
      const result = await uploader.finalizeUpload(uploadId, {
        filename: recording.name,
        mimeType: recording.mimeType,
        totalChunks,
      })

      setUploadState({
        uploading: false,
        progress: 100,
        totalChunks: 0,
        uploadedChunks: 0,
      })

      setFeedback({
        type: 'success',
        message: `Upload complete! File saved to ${result.path}`,
      })
    } catch (error) {
      setUploadState({
        uploading: false,
        progress: 0,
        totalChunks: 0,
        uploadedChunks: 0,
      })

      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Upload failed',
      })
    }
  }, [recorderService, uploader])

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Recording
        </Typography>

        {/* Recording Controls */}
        <Box sx={{ mb: 3 }}>
          {recorderState === 'idle' ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartRecording}
              disabled={uploadState.uploading}
            >
              Start Recording
            </Button>
          ) : (
            <Button variant="contained" color="error" onClick={handleStopRecording}>
              Stop Recording
            </Button>
          )}
        </Box>

        {/* Upload Progress */}
        {uploadState.uploading && (
          <Box sx={{ mb: 3 }} data-testid="upload-progress">
            <Typography variant="body2" gutterBottom>
              Uploading: {uploadState.uploadedChunks} / {uploadState.totalChunks} chunks
            </Typography>
            <LinearProgress variant="determinate" value={uploadState.progress} />
          </Box>
        )}

        {/* Feedback */}
        {feedback.type === 'success' && (
          <Alert severity="success" data-testid="success-feedback">
            {feedback.message}
          </Alert>
        )}
        {feedback.type === 'error' && (
          <Alert severity="error" data-testid="error-feedback">
            {feedback.message}
          </Alert>
        )}
      </Box>
    </Container>
  )
}

export default RecordingPage
