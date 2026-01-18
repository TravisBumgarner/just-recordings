import { Box, Button, Container, LinearProgress, Typography, Alert } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import type { RecorderService, Recording as RecordingType, RecorderState, Uploader } from '@just-recordings/recorder';

export interface RecordingPageProps {
  recorderService: RecorderService;
  uploader: Uploader;
}

export interface UploadState {
  uploading: boolean;
  progress: number;
  totalChunks: number;
  uploadedChunks: number;
}

export type FeedbackState =
  | { type: 'none' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

function RecordingPage({ recorderService, uploader }: RecordingPageProps) {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    totalChunks: 0,
    uploadedChunks: 0,
  });
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'none' });

  useEffect(() => {
    const unsubscribe = recorderService.onStateChange(setRecorderState);
    return unsubscribe;
  }, [recorderService]);

  const handleStartRecording = useCallback(async () => {
    // TODO: Implement start recording
  }, []);

  const handleStopRecording = useCallback(async () => {
    // TODO: Implement stop recording and upload
  }, []);

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
            <Button
              variant="contained"
              color="error"
              onClick={handleStopRecording}
            >
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
            <LinearProgress
              variant="determinate"
              value={uploadState.progress}
            />
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
  );
}

export default RecordingPage;
