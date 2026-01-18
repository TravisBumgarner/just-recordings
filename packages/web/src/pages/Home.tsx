import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Just Recordings
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Record and manage your video content
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/recording"
            variant="contained"
            color="primary"
          >
            Start Recording
          </Button>
          <Button
            component={Link}
            to="/recordings"
            variant="outlined"
            color="primary"
          >
            View Recordings
          </Button>
          <Button
            component={Link}
            to="/uploads"
            variant="outlined"
            color="secondary"
          >
            Upload Queue
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
