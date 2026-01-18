import { Box, Container, Typography } from '@mui/material';
import type { UploadManager } from '@just-recordings/recorder';

export interface UploadQueueProps {
  uploadManager: UploadManager;
}

function UploadQueue({ uploadManager }: UploadQueueProps) {
  // Stub implementation
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Upload Queue
        </Typography>
      </Box>
    </Container>
  );
}

export default UploadQueue;
