import { Box, Typography } from '@mui/material'

function HomeChrome() {
  return (
    <Box
      sx={{
        width: 400,
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Typography variant="h5" component="h1">
        Just Recordings
      </Typography>
    </Box>
  )
}

export default HomeChrome
