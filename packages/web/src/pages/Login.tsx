import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type ChangeEvent, useCallback, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ROUTES } from '../consts'
import { login } from '../services/supabase'
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

  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setEmail(e.target.value)
  }, [])

  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setPassword(e.target.value)
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

  if (appUser) {
    return <Navigate to="/" />
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
