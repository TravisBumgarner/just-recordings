import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type ChangeEvent, useCallback, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ROUTES } from '../consts'
import { signup } from '../services/supabase'
import GoogleSignInButton from '../sharedComponents/GoogleSignInButton'
import Link from '../sharedComponents/Link'
import Message from '../sharedComponents/Message'
import { MODAL_ID } from '../sharedComponents/Modal/Modal.consts'
import { activeModalSignal } from '../signals'
import useGlobalStore from '../store'
import authFormCSS from '../styles/shared/authFormCSS'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'
import { getValidationError, validateSignup } from '../utils/auth'
import { loadUserIntoState } from '../utils/loadUserIntoState'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const appUser = useGlobalStore((state) => state.appUser)
  const navigate = useNavigate()

  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const newPassword = e.target.value
    setPassword(newPassword)
  }, [])

  const handleRepeatPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const newRepeatPassword = e.target.value
    setRepeatPassword(newRepeatPassword)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (password !== repeatPassword) {
        setError('Passwords do not match')
        return
      }

      const result = validateSignup(email, password, repeatPassword)

      if (!result.success) {
        setError(getValidationError(result))
        return
      }

      setIsSubmitting(true)

      try {
        const response = await signup({ email, password })
        if (response.success) {
          await loadUserIntoState()
          activeModalSignal.value = {
            id: MODAL_ID.CONFIRMATION_MODAL,
            title: 'Signup Successful',
            body: 'Check your email for a confirmation.',
            confirmationCallback: async () => {
              navigate('/')
            },
          }
        } else {
          setError(response.error)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during signup')
      } finally {
        setIsSubmitting(false)
      }
    },
    [email, password, repeatPassword, navigate],
  )

  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setEmail(e.target.value)
  }, [])

  if (appUser) {
    return <Navigate to="/" />
  }

  return (
    <PageWrapper minHeight verticallyAlign width="small">
      <form onSubmit={handleSubmit} style={authFormCSS}>
        <PageTitle center text="Sign Up" />
        {error && <Message includeVerticalMargin color="error" message={error} />}
        <GoogleSignInButton text="Sign up with Google" />
        <Divider flexItem>or</Divider>
        <TextField
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={handleEmailChange}
          label="Email"
          fullWidth
          autoComplete="email"
        />
        <TextField
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={handlePasswordChange}
          label="Password"
          fullWidth
          autoComplete="new-password"
        />
        <TextField
          id="repeatPassword"
          name="repeatPassword"
          type="password"
          required
          value={repeatPassword}
          onChange={handleRepeatPasswordChange}
          label="Repeat Password"
          fullWidth
          autoComplete="new-password"
        />
        <Button
          variant="contained"
          disabled={!password || !repeatPassword || !email || isSubmitting}
          type="submit"
          fullWidth
        >
          Sign up
        </Button>

        <Typography variant="body1">
          {'Have have an account? '}
          <Link href={ROUTES.login.href()}>{ROUTES.login.label}</Link>.
        </Typography>
      </form>
    </PageWrapper>
  )
}
