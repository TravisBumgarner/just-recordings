import { Box, Button, Container, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { FaApple, FaLinux, FaWindows } from 'react-icons/fa'
import { APP_VERSION, EXTERNAL_LINKS, ROUTES } from '../consts'

function LandingPage() {
  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 300,
            fontSize: { xs: '3rem', md: '4.5rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            mb: 3,
          }}
        >
          Screen recording.
          <br />
          Nothing more.
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            mb: 4,
            maxWidth: '400px',
          }}
        >
          No bloat. No subscriptions. Just a simple tool that records your screen.
        </Typography>

        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            mb: 5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {['Save locally or to the cloud', 'Share with a link', 'Record from desktop or browser'].map(
            (item) => (
              <Typography
                component="li"
                key={item}
                sx={{
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  color: 'text.secondary',
                  '&::before': {
                    content: '"—"',
                    mr: 1.5,
                    opacity: 0.5,
                  },
                }}
              >
                {item}
              </Typography>
            ),
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Button
            component={RouterLink}
            to={ROUTES.signup.href()}
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: 1,
            }}
          >
            Get started free
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Free during beta
        </Typography>

        {/* Get the app section */}
        <Box sx={{ mt: 10 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 300,
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 1,
            }}
          >
            Get the app
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Version {APP_VERSION}
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { name: 'Windows', icon: FaWindows, url: EXTERNAL_LINKS.windows },
              { name: 'macOS', icon: FaApple, url: EXTERNAL_LINKS.mac },
              { name: 'Linux', icon: FaLinux, url: EXTERNAL_LINKS.linux },
            ].map((platform) => (
              <Box
                key={platform.name}
                component="a"
                href={platform.url}
                sx={{
                  p: 4,
                  border: 2,
                  borderColor: 'divider',
                  borderRadius: 3,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <platform.icon size={80} />
                <Typography variant="h6" fontWeight={500}>{platform.name}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default LandingPage
