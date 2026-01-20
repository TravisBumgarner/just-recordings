import { useEffect, useState } from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { checkHealth } from '../services/api'

type HealthStatus = 'loading' | 'connected' | 'error'

function Home() {
  const versions = window.api.getVersions()
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('loading')

  useEffect(() => {
    checkHealth()
      .then(() => setHealthStatus('connected'))
      .catch(() => setHealthStatus('error'))
  }, [])

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

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Environment
          </Typography>
          <Typography variant="body2">Electron: {versions.electron}</Typography>
          <Typography variant="body2">Chrome: {versions.chrome}</Typography>
          <Typography variant="body2">Node: {versions.node}</Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Backend Status
          </Typography>
          <Typography variant="body2">
            {healthStatus === 'loading' && 'Loading...'}
            {healthStatus === 'connected' && 'Connected'}
            {healthStatus === 'error' && 'Error: Disconnected'}
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

export default Home
