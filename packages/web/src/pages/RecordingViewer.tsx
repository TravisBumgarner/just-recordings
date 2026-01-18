import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Typography,
} from '@mui/material';
import { getRecording, getVideoUrl, deleteRecording } from '../services/api';
import type { RecordingMetadata } from '../types/api';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function RecordingViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recording, setRecording] = useState<RecordingMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRecording = async () => {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const recordingData = await getRecording(id);
        if (!recordingData) {
          setError(true);
        } else {
          setRecording(recordingData);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRecording();
  }, [id]);

  const videoUrl = id ? getVideoUrl(id) : undefined;

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (recording?.id) {
      await deleteRecording(recording.id);
      navigate('/recordings');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} data-testid="loading-indicator">
            <CircularProgress />
          </Box>
        </Box>
      </Container>
    );
  }

  if (error || !recording) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Box sx={{ textAlign: 'center', py: 4 }} data-testid="error-state">
            <Typography variant="h6" color="text.secondary">
              Recording not found
            </Typography>
            <Button component={Link} to="/recordings" sx={{ mt: 2 }}>
              Back to Recordings
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Button component={Link} to="/recordings" sx={{ mb: 2 }}>
          Back to Recordings
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          {recording.name}
        </Typography>

        {/* Video Player */}
        <Box sx={{ mb: 3 }}>
          <video
            data-testid="video-player"
            src={videoUrl}
            controls
            style={{ width: '100%', maxHeight: '70vh' }}
          />
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
        >
          Delete Recording
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
      </Box>
    </Container>
  );
}

export default RecordingViewerPage;
