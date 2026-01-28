import type { AuthMFAEnrollResponse, Factor, User } from '@supabase/supabase-js'
import type { AuthClient } from './client'

export type { User }

export type AuthResponse = { success: true; data?: unknown } | { error: string; success: false }

export type GetUserResponse =
  | { user: User | null; success: true }
  | { error: string; success: false }

export type GetTokenResponse =
  | { token: string | undefined; success: true }
  | { message: string; success: false }

export type EnrollMfaResponse =
  | { success: true; data: AuthMFAEnrollResponse['data'] }
  | { error: string; success: false }

export type VerifyMfaResponse = { success: true } | { error: string; success: false }

export type UnenrollMfaResponse = { success: true } | { error: string; success: false }

export type ListMfaFactorsResponse =
  | { success: true; factors: Factor[] }
  | { error: string; success: false }

export type GetAssuranceLevelResponse =
  | { success: true; currentLevel: string | null; nextLevel: string | null }
  | { error: string; success: false }

export async function getUser(client: AuthClient): Promise<GetUserResponse> {
  const sessionExists = await client.auth.getSession()

  if (!sessionExists.data.session) {
    return { user: null, success: true }
  }

  const { data, error } = await client.auth.getUser()
  if (error) {
    return { error: 'Get user failed', success: false }
  }

  return { user: data.user, success: true }
}

export async function login(
  client: AuthClient,
  credentials: { email: string; password: string },
): Promise<AuthResponse> {
  const { error, data } = await client.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })
  if (error) {
    return { error: 'Login Failed', success: false }
  }

  return { success: true, data }
}

export async function signup(
  client: AuthClient,
  credentials: { email: string; password: string },
): Promise<AuthResponse> {
  const { error } = await client.auth.signUp({
    email: credentials.email,
    password: credentials.password,
  })
  if (error) {
    return { error: 'Signup failed', success: false }
  }
  return { success: true }
}

export async function logout(client: AuthClient): Promise<AuthResponse> {
  await client.auth.signOut()
  return { success: true }
}

export async function getToken(client: AuthClient): Promise<GetTokenResponse> {
  const { data, error } = await client.auth.getSession()
  if (error) {
    return { message: 'Get token failed', success: false }
  }
  return { token: data.session?.access_token, success: true }
}

export async function resetPassword(
  client: AuthClient,
  email: string,
  redirectUrl: string,
): Promise<AuthResponse> {
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })
  if (error) {
    return { error: 'Failed to send reset email', success: false }
  }
  return { success: true }
}

export async function updatePassword(client: AuthClient, password: string): Promise<AuthResponse> {
  const { error } = await client.auth.updateUser({ password })
  if (error) {
    return { error: 'Failed to update password', success: false }
  }
  return { success: true }
}

export async function enrollMfa(
  client: AuthClient,
  friendlyName?: string,
): Promise<EnrollMfaResponse> {
  const { data, error } = await client.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName,
  })
  if (error) {
    return { error: 'Failed to enroll MFA', success: false }
  }
  return { success: true, data }
}

export async function verifyMfa(
  client: AuthClient,
  factorId: string,
  code: string,
): Promise<VerifyMfaResponse> {
  const { data: challengeData, error: challengeError } = await client.auth.mfa.challenge({
    factorId,
  })
  if (challengeError) {
    return { error: 'Failed to create MFA challenge', success: false }
  }

  const { error: verifyError } = await client.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  })
  if (verifyError) {
    return { error: 'Invalid verification code', success: false }
  }

  return { success: true }
}

export async function unenrollMfa(
  client: AuthClient,
  factorId: string,
): Promise<UnenrollMfaResponse> {
  const { error } = await client.auth.mfa.unenroll({ factorId })
  if (error) {
    return { error: 'Failed to unenroll MFA', success: false }
  }
  return { success: true }
}

export async function listMfaFactors(client: AuthClient): Promise<ListMfaFactorsResponse> {
  const { data, error } = await client.auth.mfa.listFactors()
  if (error) {
    return { error: 'Failed to list MFA factors', success: false }
  }
  const verifiedFactors = data.totp.filter((f) => f.status === 'verified')
  return { success: true, factors: verifiedFactors }
}

export async function getAssuranceLevel(client: AuthClient): Promise<GetAssuranceLevelResponse> {
  const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error) {
    return { error: 'Failed to get assurance level', success: false }
  }
  return {
    success: true,
    currentLevel: data.currentLevel,
    nextLevel: data.nextLevel,
  }
}
