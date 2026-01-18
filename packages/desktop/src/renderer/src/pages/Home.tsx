import { Box, Container, Typography } from '@mui/material';

// Stub: Returns placeholder values so tests fail (TDD red phase)
function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Just Recordings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Desktop app for recording and managing your video content
        </Typography>
      </Box>
    </Container>
  );
}

export default Home;
