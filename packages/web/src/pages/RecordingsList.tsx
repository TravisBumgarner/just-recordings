import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import type { RecorderService, Recording } from '@just-recordings/recorder';

export interface RecordingsListPageProps {
  recorderService: RecorderService;
}

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

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function RecordingsListPage({ recorderService }: RecordingsListPageProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      const allRecordings = await recorderService.getAllRecordings();
      setRecordings(allRecordings);
      setLoading(false);
    };
    fetchRecordings();
  }, [recorderService]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Recordings
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }} data-testid="loading-indicator">
            <CircularProgress />
          </Box>
        </Box>
      </Container>
    );
  }

  if (recordings.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Recordings
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }} data-testid="empty-state">
            <Typography variant="h6" color="text.secondary">
              No recordings yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start recording to see your videos here.
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Recordings
        </Typography>
        <Grid container spacing={3}>
          {recordings.map((recording) => (
            <Grid item xs={12} sm={6} md={4} key={recording.id}>
              <Card>
                <CardActionArea
                  component={Link}
                  to={`/recordings/${recording.id}`}
                  aria-label={recording.name}
                >
                  <CardContent>
                    <Typography variant="h6" component="h2" noWrap>
                      {recording.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDuration(recording.duration)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(recording.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(recording.fileSize)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default RecordingsListPage;
