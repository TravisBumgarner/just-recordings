import { Box, Button, Container, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { ROUTES } from '../consts'

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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
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
          <Typography variant="body2" color="text.secondary">
            Free during beta
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default LandingPage
