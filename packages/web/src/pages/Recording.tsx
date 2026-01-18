import { Box, Button, Container, Typography, Alert } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import type { RecorderService, RecorderState, UploadManager } from '@just-recordings/recorder';

export interface RecordingPageProps {
  recorderService: RecorderService;
  uploadManager: UploadManager;
}

export type FeedbackState =
  | { type: 'none' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

function RecordingPage({ recorderService, uploadManager }: RecordingPageProps) {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'none' });

  useEffect(() => {
    const unsubscribe = recorderService.onStateChange(setRecorderState);
    return unsubscribe;
  }, [recorderService]);

  const handleStartRecording = useCallback(async () => {
    setFeedback({ type: 'none' });
    await recorderService.startScreenRecording();
  }, [recorderService]);

  const handleStopRecording = useCallback(async () => {
    try {
      // Stop recording and get the recording data
      const recording = await recorderService.stopRecording();

      // Enqueue to UploadManager (saves to IndexedDB, uploads in background)
      await uploadManager.enqueue(recording);

      // Show immediate feedback - recording is saved, uploading in background
      setFeedback({
        type: 'success',
        message: 'Recording saved! Uploading in background...',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save recording',
      });
    }
  }, [recorderService, uploadManager]);

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
