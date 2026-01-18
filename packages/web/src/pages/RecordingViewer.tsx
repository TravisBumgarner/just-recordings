import { Box, Container, Typography } from '@mui/material';
import type { RecorderService } from '@just-recordings/recorder';

export interface RecordingViewerPageProps {
  recorderService: RecorderService;
}

function RecordingViewerPage({ recorderService }: RecordingViewerPageProps) {
  // Stub implementation
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Recording
        </Typography>
      </Box>
    </Container>
  );
}

export default RecordingViewerPage;
