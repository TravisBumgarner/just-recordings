import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { AuthMFAEnrollResponse } from '@supabase/supabase-js'
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '../consts'
import { enrollMfa, listMfaFactors, unenrollMfa, verifyMfa } from '../services/supabase'
import Link from '../sharedComponents/Link'
import Message from '../sharedComponents/Message'
import { activeModalSignal } from '../signals'
import useGlobalStore from '../store'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'
import { SPACING } from '../styles/styleConsts'

type MfaState = 'loading' | 'not_enrolled' | 'enrolling' | 'enrolled'

const Profile = () => {
  const appUser = useGlobalStore((state) => state.appUser)
  const authUser = useGlobalStore((state) => state.authUser)

  const [mfaState, setMfaState] = useState<MfaState>('loading')
  const [enrollData, setEnrollData] = useState<AuthMFAEnrollResponse['data'] | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [enrolledFactorId, setEnrolledFactorId] = useState<string | null>(null)
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEmailAuth = useMemo(
    () => !!authUser?.identities && authUser.identities[0].provider === 'email',
    [authUser],
  )

  const loadMfaStatus = useCallback(async () => {
    const response = await listMfaFactors()
    if (response.success && response.factors.length > 0) {
      setEnrolledFactorId(response.factors[0].id)
      setMfaState('enrolled')
    } else {
      setMfaState('not_enrolled')
    }
  }, [])

  useEffect(() => {
    if (isEmailAuth) {
      loadMfaStatus()
    }
  }, [isEmailAuth, loadMfaStatus])

  const handleStartEnroll = useCallback(async () => {
    setMfaError(null)
    const response = await enrollMfa()
    if (response.success) {
      setEnrollData(response.data)
      setMfaState('enrolling')
    } else {
      setMfaError(response.error)
    }
  }, [])

  const handleCancelEnroll = useCallback(async () => {
    if (enrollData?.id) {
      await unenrollMfa(enrollData.id)
    }
    setEnrollData(null)
    setVerifyCode('')
    setMfaError(null)
    setMfaState('not_enrolled')
  }, [enrollData])

  const handleVerifyEnroll = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!enrollData?.id) return

      setIsSubmitting(true)
      setMfaError(null)
      const response = await verifyMfa(enrollData.id, verifyCode)
      if (response.success) {
        setEnrolledFactorId(enrollData.id)
        setEnrollData(null)
        setVerifyCode('')
        setMfaState('enrolled')
      } else {
        setMfaError(response.error)
      }
      setIsSubmitting(false)
    },
    [enrollData, verifyCode],
  )

  const handleDisableMfa = useCallback(() => {
    activeModalSignal.value = {
      id: 'CONFIRMATION_MODAL',
      title: 'Disable Two-Factor Authentication',
      body: 'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
      showCancel: true,
      confirmationCallback: async () => {
        if (!enrolledFactorId) return
        const response = await unenrollMfa(enrolledFactorId)
        if (response.success) {
          setEnrolledFactorId(null)
          setMfaState('not_enrolled')
        } else {
          setMfaError(response.error)
        }
      },
    }
  }, [enrolledFactorId])

  const handleVerifyCodeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMfaError(null)
    setVerifyCode(e.target.value)
  }, [])

  if (!appUser || !authUser) {
    return <Navigate to="/" />
  }

  const _regDate = new Date(authUser.created_at).toDateString()
  return (
    <PageWrapper width="full" minHeight>
      <PageTitle text="User Settings" marginBottom />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACING.SMALL.PX,
        }}
      >
        <Typography variant="body1">
          <strong>Email:</strong> {appUser.email}
        </Typography>
        {isEmailAuth && (
          <Typography variant="body1">
            <strong>Password:</strong>{' '}
            <Link href={ROUTES.passwordReset.href()}>Change Password</Link>
          </Typography>
        )}
      </Box>

      {isEmailAuth && (
        <Box sx={{ marginTop: SPACING.LARGE.PX }}>
          <Typography variant="h6" sx={{ marginBottom: SPACING.SMALL.PX }}>
            Two-Factor Authentication
          </Typography>

          {mfaError && <Message includeVerticalMargin color="error" message={mfaError} />}

          {mfaState === 'loading' && <Typography variant="body1">Loading MFA status...</Typography>}

          {mfaState === 'not_enrolled' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING.SMALL.PX }}>
              <Typography variant="body1">
                Add an extra layer of security to your account by enabling two-factor
                authentication.
              </Typography>
              <Box>
                <Button variant="contained" onClick={handleStartEnroll}>
                  Enable Two-Factor Authentication
                </Button>
              </Box>
            </Box>
          )}

          {mfaState === 'enrolling' && enrollData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING.MEDIUM.PX }}>
              <Typography variant="body1">
                Scan the QR code below with your authenticator app, then enter the 6-digit
                verification code.
              </Typography>
              {'totp' in enrollData && (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <img src={enrollData.totp.qr_code} alt="MFA QR Code" width={200} height={200} />
                  </Box>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', textAlign: 'center' }}>
                    <strong>Secret:</strong> {enrollData.totp.secret}
                  </Typography>
                </>
              )}
              <form onSubmit={handleVerifyEnroll}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING.SMALL.PX }}>
                  <TextField
                    id="mfa-verify-code"
                    name="mfa-verify-code"
                    type="text"
                    required
                    label="Verification Code"
                    autoComplete="one-time-code"
                    fullWidth
                    value={verifyCode}
                    onChange={handleVerifyCodeChange}
                    inputProps={{ maxLength: 6, pattern: '[0-9]{6}', inputMode: 'numeric' }}
                    autoFocus
                  />
                  <Box sx={{ display: 'flex', gap: SPACING.SMALL.PX }}>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={verifyCode.length !== 6 || isSubmitting}
                    >
                      Verify and Enable
                    </Button>
                    <Button variant="outlined" onClick={handleCancelEnroll}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </form>
            </Box>
          )}

          {mfaState === 'enrolled' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING.SMALL.PX }}>
              <Typography variant="body1">
                Two-factor authentication is currently <strong>enabled</strong>.
              </Typography>
              <Box>
                <Button variant="outlined" color="error" onClick={handleDisableMfa}>
                  Disable Two-Factor Authentication
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </PageWrapper>
  )
}

export default Profile
