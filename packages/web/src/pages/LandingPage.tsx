import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { ROUTES } from '../consts'

const features = [
  {
    emoji: '🎥',
    title: 'Simple Recording',
    description: 'Record your screen with one click. No complicated setup required.',
  },
  {
    emoji: '⚡',
    title: 'Fast & Lightweight',
    description: 'No bloat. Just the essentials you need to capture your screen.',
  },
  {
    emoji: '👆',
    title: 'Easy to Use',
    description: 'Intuitive interface that gets out of your way.',
  },
  {
    emoji: '💰',
    title: 'Affordable',
    description: 'Screen recording without the premium price tag.',
  },
]

function LandingPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', fontSize: { xs: '2.5rem', md: '3.5rem' } }}
          >
            Just Recordings
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{ mb: 4, opacity: 0.9, fontSize: { xs: '1.2rem', md: '1.5rem' } }}
          >
            Screen recording. Nothing more.
          </Typography>
          <Button
            component={RouterLink}
            to={ROUTES.signup.href()}
            variant="contained"
            color="secondary"
            size="large"
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Sign Up Free
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 'medium' }}
        >
          Simple by Design
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  textAlign: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ fontSize: '2.5rem', mb: 2 }}>{feature.emoji}</Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Box sx={{ bgcolor: 'grey.100', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
            Pricing
          </Typography>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
            <Typography
              variant="h3"
              component="p"
              color="primary"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Free
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              During Beta
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Get full access while we're in beta. No credit card required.
            </Typography>
            <Button
              component={RouterLink}
              to={ROUTES.signup.href()}
              variant="contained"
              size="large"
              sx={{ px: 4 }}
            >
              Get Started
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Footer CTA */}
      <Box sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography variant="h5" component="p" gutterBottom>
            Ready to start recording?
          </Typography>
          <Button
            component={RouterLink}
            to={ROUTES.signup.href()}
            variant="contained"
            size="large"
            sx={{ px: 4, mt: 2 }}
          >
            Sign Up Now
          </Button>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage
