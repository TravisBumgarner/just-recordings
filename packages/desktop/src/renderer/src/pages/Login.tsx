// Stub - to be implemented
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export default function LoginPage() {
  return (
    <Box>
      <Typography variant="h5">Log In</Typography>
      <form>
        <TextField label="Email" type="email" name="email" />
        <TextField label="Password" type="password" name="password" />
        <Button type="submit">Log In</Button>
      </form>
    </Box>
  )
}
