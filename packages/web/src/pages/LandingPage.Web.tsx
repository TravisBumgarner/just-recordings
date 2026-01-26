import { Box, Button, Container, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { FaApple, FaLinux, FaWindows } from 'react-icons/fa'
import { APP_VERSION, EXTERNAL_LINKS, ROUTES } from '../consts'
import { ComparisonTable } from '../components/ComparisonTable'

const platforms = [
  { name: 'Windows', icon: FaWindows, url: EXTERNAL_LINKS.windows },
  { name: 'macOS', icon: FaApple, url: EXTERNAL_LINKS.mac },
  { name: 'Linux', icon: FaLinux, url: EXTERNAL_LINKS.linux },
]

function LandingPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '3.5rem', sm: '5rem', md: '6rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1,
              mb: 4,
            }}
          >
            Screen recording.
            <br />
            Nothing more.
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              fontSize: { xs: '1.25rem', md: '1.5rem' },
              mb: 6,
              maxWidth: '600px',
              lineHeight: 1.6,
            }}
          >
            No bloat. No subscriptions. Just a simple tool that records your screen.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
            <Button
              component={RouterLink}
              to={ROUTES.signup.href()}
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.25rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Get started free
            </Button>
            <Button
              component="a"
              href="#download"
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 2,
                fontSize: '1.25rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
              }}
            >
              Download desktop app
            </Button>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Free during beta
          </Typography>
        </Container>
      </Box>

      {/* Features */}
      <Box sx={{ py: 12, bgcolor: 'action.hover' }}>
        <Container maxWidth="md">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 6,
            }}
          >
            {['Save locally or to the cloud', 'Share with a link', 'Record from desktop or browser'].map(
              (item) => (
                <Typography
                  key={item}
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: 500,
                  }}
                >
                  {item}
                </Typography>
              ),
            )}
          </Box>
        </Container>
      </Box>

      {/* Comparison Section */}
      <Box sx={{ py: 12 }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              letterSpacing: '-0.02em',
              mb: 6,
              textAlign: 'center',
            }}
          >
            How we compare
          </Typography>
          <ComparisonTable />
        </Container>
      </Box>

      {/* Download Section */}
      <Box id="download" sx={{ py: 16, scrollMarginTop: '2rem' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              letterSpacing: '-0.02em',
              mb: 2,
              textAlign: 'center',
            }}
          >
            Get the app
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 8, textAlign: 'center', fontSize: '1.25rem' }}
          >
            Version {APP_VERSION}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: { xs: 4, md: 6 },
              maxWidth: '900px',
              mx: 'auto',
            }}
          >
            {platforms.map((platform) => (
              <Box
                key={platform.name}
                component="a"
                href={platform.url}
                sx={{
                  p: { xs: 5, md: 6 },
                  bgcolor: 'action.hover',
                  borderRadius: 4,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'action.selected',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <platform.icon size={120} />
                <Typography variant="h4" fontWeight={600}>
                  {platform.name}
                </Typography>
                <Typography
                  variant="button"
                  sx={{
                    fontSize: '1rem',
                    textTransform: 'none',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                >
                  Download →
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage
