import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { type ChangeEvent, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../consts'
import { resetPassword, updatePassword } from '../services/supabase'
import Link from '../sharedComponents/Link'
import Loading from '../sharedComponents/Loading'
import Message from '../sharedComponents/Message'
import useGlobalStore from '../store'
import authFormCSS from '../styles/shared/authFormCSS'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'
import { getValidationError, validateEmail, validatePassword } from '../utils/auth'

export default function PasswordResetPage() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const appUser = useGlobalStore((state) => state.appUser)
  const loadingUser = useGlobalStore((state) => state.loadingUser)

  const navigate = useNavigate()

  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setMessage(null)
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

  const handleResetRequest = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsLoading(true)

      const result = validateEmail(email)

      if (!result.success) {
        setError(getValidationError(result))
        setIsLoading(false)
        return
      }

      const response = await resetPassword(email)

      if (response.success) {
        setMessage(
          'Password reset instructions have been sent to your email. Please check your inbox and spam folder.',
        )
        setEmail('')
      } else {
        setError(response.error || 'Failed to send reset email')
      }

      setIsLoading(false)
    },
    [email],
  )

  const handlePasswordUpdate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsLoading(true)

      const result = validatePassword(password, confirmPassword)

      if (!result.success) {
        setError(result.error.issues[0].message)
        setIsLoading(false)
        return
      }

      const response = await updatePassword(password)

      if (response.success) {
        setMessage('Password updated successfully! Redirecting home...')

        setTimeout(() => {
          navigate(ROUTES.home.href())
        }, 2000)
      } else {
        setError(response.error || 'Failed to update password')
      }

      setIsLoading(false)
    },
    [password, confirmPassword, navigate],
  )

  if (loadingUser) {
    return (
      <PageWrapper minHeight verticallyAlign width="small">
        <Loading />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper minHeight verticallyAlign width="small">
      <form onSubmit={appUser ? handlePasswordUpdate : handleResetRequest} style={authFormCSS}>
        <PageTitle text={appUser ? 'Set New Password' : 'Reset Password'} center />

        {error && <Message color="error" message={error} />}

        {message && <Message color="info" message={message} />}

        {!appUser ? (
          // Email reset form
          <>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            <TextField
              id="email"
              name="email"
              type="email"
              required
              label="Email Address"
              autoComplete="email"
              fullWidth
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
            />
            <Button variant="contained" type="submit" fullWidth disabled={isLoading || !email}>
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </>
        ) : (
          // Password update form
          <>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Enter your new password below.
            </Typography>
            <TextField
              id="password"
              name="password"
              type="password"
              required
              label="New Password"
              autoComplete="new-password"
              fullWidth
              value={password}
              onChange={handlePasswordChange}
              disabled={isLoading}
            />
            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              label="Confirm New Password"
              autoComplete="new-password"
              fullWidth
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isLoading}
            />
            <Button variant="contained" type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </>
        )}
        <Box>
          <Typography variant="body1">
            Remember your password? <Link href={ROUTES.login.href()}>{ROUTES.login.label}</Link>
          </Typography>

          {!appUser && (
            <Typography variant="body1">
              {"Don't have an account? "}
              <Link href={ROUTES.signup.href()}>{ROUTES.signup.label}</Link>
            </Typography>
          )}
        </Box>
      </form>
    </PageWrapper>
  )
}
