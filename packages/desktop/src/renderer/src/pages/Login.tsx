import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getValidationError, validateEmail } from '@just-recordings/shared/auth'
import { type ChangeEvent, type FormEvent, useCallback, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { login } from '../services/supabase'
import { loadUserIntoState } from '../stores/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setEmail(e.target.value)
  }, [])

  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setPassword(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const emailResult = validateEmail(email)
      if (!emailResult.success) {
        setError(getValidationError(emailResult))
        return
      }

      setIsSubmitting(true)

      const response = await login({ email, password })

      if (response.success) {
        await loadUserIntoState()
      } else {
        setError(response.error ?? 'Login failed')
      }

      setIsSubmitting(false)
    },
    [email, password],
  )

  return (
    <Box sx={{ p: 2, maxWidth: 360, mx: 'auto' }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2, textAlign: 'center' }}>
        Log In
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={handleEmailChange}
          fullWidth
          sx={{ mb: 2 }}
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          fullWidth
          sx={{ mb: 2 }}
          autoComplete="current-password"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        >
          Log In
        </Button>
      </form>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          {"Don't have an account? "}
          <Link component={RouterLink} to="/signup">
            Sign Up
          </Link>
        </Typography>
        <Typography variant="body2">
          {"Forgot your password? "}
          <Link component={RouterLink} to="/password-reset">
            Reset Password
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
