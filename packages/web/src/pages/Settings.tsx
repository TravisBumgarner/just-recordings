import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { AuthMFAEnrollResponse } from '@supabase/supabase-js'
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '../consts'
import {
  challengeMfa,
  enrollMfa,
  listMfaFactors,
  unenrollMfa,
  verifyMfa,
} from '../services/supabase'
import Link from '../sharedComponents/Link'
import Message from '../sharedComponents/Message'
import { activeModalSignal } from '../signals'
import useGlobalStore from '../store'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'
import { SPACING } from '../styles/styleConsts'

type MfaState = 'loading' | 'not_enrolled' | 'enrolling' | 'enrolled'
type MfaMethod = 'totp' | 'phone'

const Profile = () => {
  const appUser = useGlobalStore((state) => state.appUser)
  const authUser = useGlobalStore((state) => state.authUser)

  const [mfaState, setMfaState] = useState<MfaState>('loading')
  const [enrollData, setEnrollData] = useState<AuthMFAEnrollResponse['data'] | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [enrolledFactorId, setEnrolledFactorId] = useState<string | null>(null)
  const [enrolledFactorType, setEnrolledFactorType] = useState<MfaMethod | null>(null)
  const [mfaError, setMfaError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMfaMethod, setSelectedMfaMethod] = useState<MfaMethod | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)

  const isEmailAuth = useMemo(
    () => !!authUser?.identities && authUser.identities[0].provider === 'email',
    [authUser],
  )

  const loadMfaStatus = useCallback(async () => {
    const response = await listMfaFactors()
    if (response.success && response.factors.length > 0) {
      const factor = response.factors[0]
      setEnrolledFactorId(factor.id)
      setEnrolledFactorType(factor.factor_type as MfaMethod)
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

  const handleStartEnrollTotp = useCallback(async () => {
    setMfaError(null)
    setSelectedMfaMethod('totp')
    const response = await enrollMfa({ factorType: 'totp' })
    if (response.success) {
      setEnrollData(response.data)
      setMfaState('enrolling')
    } else {
      setMfaError(response.error)
      setSelectedMfaMethod(null)
    }
  }, [])

  const handleStartEnrollPhone = useCallback(async () => {
    if (!phoneNumber) return
    setMfaError(null)
    setSelectedMfaMethod('phone')
    const response = await enrollMfa({ factorType: 'phone', phone: phoneNumber })
    if (response.success) {
      setEnrollData(response.data)
      setMfaState('enrolling')
      // Send the initial SMS challenge
      const challengeResponse = await challengeMfa(response.data.id)
      if (challengeResponse.success) {
        setChallengeId(challengeResponse.challengeId)
      } else {
        setMfaError(challengeResponse.error)
      }
    } else {
      setMfaError(response.error)
      setSelectedMfaMethod(null)
    }
  }, [phoneNumber])

  const handleResendCode = useCallback(async () => {
    if (!enrollData?.id) return
    setMfaError(null)
    const res = await challengeMfa(enrollData.id)
    if (res.success) {
      setChallengeId(res.challengeId)
    } else {
      setMfaError(res.error)
    }
  }, [enrollData])

  const handleCancelEnroll = useCallback(async () => {
    if (enrollData?.id) {
      await unenrollMfa(enrollData.id)
    }
    setEnrollData(null)
    setVerifyCode('')
    setMfaError(null)
    setSelectedMfaMethod(null)
    setPhoneNumber('')
    setChallengeId(null)
    setMfaState('not_enrolled')
  }, [enrollData])

  const handleVerifyEnroll = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!enrollData?.id) return

      setIsSubmitting(true)
      setMfaError(null)
      const response = await verifyMfa(
        enrollData.id,
        verifyCode,
        selectedMfaMethod === 'phone' ? challengeId ?? undefined : undefined,
      )
      if (response.success) {
        setEnrolledFactorId(enrollData.id)
        setEnrolledFactorType(selectedMfaMethod)
        setEnrollData(null)
        setVerifyCode('')
        setSelectedMfaMethod(null)
        setPhoneNumber('')
        setChallengeId(null)
        setMfaState('enrolled')
      } else {
        setMfaError(response.error)
      }
      setIsSubmitting(false)
    },
    [enrollData, verifyCode, selectedMfaMethod, challengeId],
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
          setEnrolledFactorType(null)
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

  const handlePhoneNumberChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setMfaError(null)
    setPhoneNumber(e.target.value)
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

          {mfaState === 'not_enrolled' && !selectedMfaMethod && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING.SMALL.PX }}>
              <Typography variant="body1">
                Add an extra layer of security to your account by enabling two-factor
                authentication.
              </Typography>
              <Box sx={{ display: 'flex', gap: SPACING.SMALL.PX }}>
                <Button variant="contained" onClick={handleStartEnrollTotp}>
                  Authenticator App
                </Button>
                <Button variant="contained" disabled>
                  Phone (SMS) — Coming Soon
                </Button>
              </Box>
            </Box>
          )}

          {mfaState === 'not_enrolled' && selectedMfaMethod === 'phone' && !enrollData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING.SMALL.PX }}>
              <Typography variant="body1">
                Enter your phone number to receive verification codes via SMS.
              </Typography>
              <TextField
                id="phone-number"
                name="phone-number"
                type="tel"
                required
                label="Phone Number"
                autoComplete="tel"
                fullWidth
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="+1234567890"
              />
              <Box sx={{ display: 'flex', gap: SPACING.SMALL.PX }}>
                <Button
                  variant="contained"
                  onClick={handleStartEnrollPhone}
                  disabled={!phoneNumber}
                >
                  Send Code
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedMfaMethod(null)
                    setPhoneNumber('')
                    setMfaError(null)
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}

          {mfaState === 'enrolling' && enrollData && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: SPACING.MEDIUM.PX }}>
              {selectedMfaMethod === 'totp' && (
                <>
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
                        <img
                          src={enrollData.totp.qr_code}
                          alt="MFA QR Code"
                          width={200}
                          height={200}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: 'break-all', textAlign: 'center' }}
                      >
                        <strong>Secret:</strong> {enrollData.totp.secret}
                      </Typography>
                    </>
                  )}
                </>
              )}
              {selectedMfaMethod === 'phone' && (
                <Typography variant="body1">
                  A verification code has been sent to your phone via SMS. Enter the 6-digit code
                  below.
                </Typography>
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
                    {selectedMfaMethod === 'phone' && (
                      <Button variant="outlined" onClick={handleResendCode}>
                        Resend Code
                      </Button>
                    )}
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
                Two-factor authentication is currently <strong>enabled</strong>
                {enrolledFactorType === 'phone'
                  ? ' via SMS.'
                  : ' via authenticator app.'}
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
