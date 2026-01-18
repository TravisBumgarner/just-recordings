import { Box, Container, Typography } from '@mui/material';
import type { RecorderService, Recording } from '@just-recordings/recorder';

export interface RecordingsListPageProps {
  recorderService: RecorderService;
}

function RecordingsListPage({ recorderService }: RecordingsListPageProps) {
  // Stub implementation
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Recordings
        </Typography>
      </Box>
    </Container>
  );
}

export default RecordingsListPage;
