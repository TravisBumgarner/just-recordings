import { Box, Button, Container, Typography } from '@mui/material'
import { FaApple, FaLinux, FaWindows } from 'react-icons/fa'
import { APP_VERSION, EXTERNAL_LINKS } from '../consts'
import PageWrapper from '../styles/shared/PageWrapper'

const platforms = [
  {
    name: 'Windows',
    icon: FaWindows,
    url: EXTERNAL_LINKS.windows,
    description: 'Windows 10 or later (64-bit)',
  },
  {
    name: 'macOS',
    icon: FaApple,
    url: EXTERNAL_LINKS.mac,
    description: 'macOS 10.15 or later',
  },
  {
    name: 'Linux',
    icon: FaLinux,
    url: EXTERNAL_LINKS.linux,
    description: 'Debian/Ubuntu (.deb)',
  },
]

function Downloads() {
  return (
    <PageWrapper width="narrow">
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 300,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            letterSpacing: '-0.02em',
            mb: 2,
          }}
        >
          Download Just Recordings
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: '1.1rem', mb: 1 }}
        >
          Version {APP_VERSION}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 5, maxWidth: 500 }}
        >
          Download the desktop app for the best recording experience with system audio capture and more.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {platforms.map((platform) => (
            <Box
              key={platform.name}
              sx={{
                p: 3,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <platform.icon size={48} />
              <Typography variant="h6" component="h2">
                {platform.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {platform.description}
              </Typography>
              <Button
                variant="contained"
                href={platform.url}
                sx={{ mt: 'auto', textTransform: 'none' }}
              >
                Download
              </Button>
            </Box>
          ))}
        </Box>
      </Container>
    </PageWrapper>
  )
}

export default Downloads
