import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { getValidationError, validateSignup } from '@just-recordings/shared/auth'
import { type ChangeEvent, type FormEvent, useCallback, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { signup } from '../services/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setEmail(e.target.value)
  }, [])

  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setPassword(e.target.value)
  }, [])

  const handleConfirmPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setConfirmPassword(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const result = validateSignup(email, password, confirmPassword)
      if (!result.success) {
        setError(getValidationError(result))
        return
      }

      setIsSubmitting(true)

      const response = await signup({ email, password })

      if (response.success) {
        setSuccess(true)
      } else {
        setError(response.error ?? 'Signup failed')
      }

      setIsSubmitting(false)
    },
    [email, password, confirmPassword],
  )

  return (
    <Box sx={{ p: 2, maxWidth: 360, mx: 'auto' }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2, textAlign: 'center' }}>
        Sign Up
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Check your email for a confirmation link.
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
          autoComplete="new-password"
        />
        <TextField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          fullWidth
          sx={{ mb: 2 }}
          autoComplete="new-password"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        >
          Sign Up
        </Button>
      </form>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          {'Already have an account? '}
          <Link component={RouterLink} to="/login">
            Log In
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
