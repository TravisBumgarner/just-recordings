import { Box, Button, Container, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Just Recordings
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Desktop app for recording and managing your video content
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button component={Link} to="/recording" variant="contained" color="primary">
            Start Recording
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default Home
