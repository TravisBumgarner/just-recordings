import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type ChangeEvent, useCallback, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ROUTES } from '../consts'
import { getAssuranceLevel, listMfaFactors, login, verifyMfa } from '../services/supabase'
import Link from '../sharedComponents/Link'
import Message from '../sharedComponents/Message'
import useGlobalStore from '../store'
import authFormCSS from '../styles/shared/authFormCSS'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'
import { getValidationError, validateEmail } from '../utils/auth'
import { loadUserIntoState } from '../utils/loadUserIntoState'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const appUser = useGlobalStore((state) => state.appUser)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState('')

  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setEmail(e.target.value)
  }, [])

  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setPassword(e.target.value)
  }, [])

  const handleTotpCodeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setTotpCode(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const result = validateEmail(email)

      if (!result.success) {
        setError(getValidationError(result))
        return
      }
      setIsSubmitting(true)

      const response = await login({ email, password })

      if (response.success) {
        const aalResponse = await getAssuranceLevel()
        if (aalResponse.success && aalResponse.nextLevel === 'aal2') {
          const factorsResponse = await listMfaFactors()
          if (factorsResponse.success && factorsResponse.factors.length > 0) {
            setMfaFactorId(factorsResponse.factors[0].id)
            setIsSubmitting(false)
            return
          }
        }

        const success = await loadUserIntoState()
        if (success) {
          navigate(ROUTES.home.href())
        } else setError('Failed to load user details')
      } else {
        setError(response.error)
      }
      setIsSubmitting(false)
    },
    [navigate, email, password],
  )

  const handleMfaSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!mfaFactorId) return

      setIsSubmitting(true)
      const response = await verifyMfa(mfaFactorId, totpCode)

      if (response.success) {
        const success = await loadUserIntoState()
        if (success) {
          navigate(ROUTES.home.href())
        } else {
          setError('Failed to load user details')
        }
      } else {
        setError(response.error)
      }
      setIsSubmitting(false)
    },
    [mfaFactorId, totpCode, navigate],
  )

  if (appUser) {
    return <Navigate to="/" />
  }

  if (mfaFactorId) {
    return (
      <PageWrapper minHeight verticallyAlign width="small">
        <form onSubmit={handleMfaSubmit} style={authFormCSS}>
          <PageTitle text="Two-Factor Authentication" center />
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            Enter the 6-digit code from your authenticator app.
          </Typography>
          {error && <Message includeVerticalMargin color="error" message={error} />}
          <TextField
            id="totp-code"
            name="totp-code"
            type="text"
            required
            label="Authentication Code"
            autoComplete="one-time-code"
            fullWidth
            value={totpCode}
            onChange={handleTotpCodeChange}
            inputProps={{ maxLength: 6, pattern: '[0-9]{6}', inputMode: 'numeric' }}
            autoFocus
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={totpCode.length !== 6 || isSubmitting}
          >
            Verify
          </Button>
        </form>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper minHeight verticallyAlign width="small">
      <form onSubmit={handleSubmit} style={authFormCSS}>
        <PageTitle text="Log In" center />
        {error && <Message includeVerticalMargin color="error" message={error} />}
        {/* <GoogleSignInButton text="Sign in with Google" /> */}
        <TextField
          id="email"
          name="email"
          type="email"
          required
          label="Email"
          autoComplete="email"
          fullWidth
          value={email}
          onChange={handleEmailChange}
        />
        <TextField
          id="password"
          name="password"
          type="password"
          required
          label="Password"
          autoComplete="current-password"
          fullWidth
          value={password}
          onChange={handlePasswordChange}
        />
        <Button
          variant="contained"
          type="submit"
          fullWidth
          disabled={!password || !email || isSubmitting}
        >
          Log in
        </Button>
        <Box>
          <Typography variant="body1">
            {"Don't have an account? "}
            <Link href={ROUTES.signup.href()}>{ROUTES.signup.label}</Link>.
          </Typography>
          <Typography variant="body1">
            {'Forgot your password? '}
            <Link href={ROUTES.passwordReset.href()}>{ROUTES.passwordReset.label}</Link>.
          </Typography>
        </Box>
      </form>
    </PageWrapper>
  )
}
