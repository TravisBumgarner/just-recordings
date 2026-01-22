// Stub - to be implemented
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

export default function SignupPage() {
  return (
    <Box>
      <Typography variant="h5">Sign Up</Typography>
      <form>
        <TextField label="Email" type="email" name="email" />
        <TextField label="Password" type="password" name="password" />
        <TextField label="Confirm Password" type="password" name="confirmPassword" />
        <Button type="submit">Sign Up</Button>
      </form>
    </Box>
  )
}
