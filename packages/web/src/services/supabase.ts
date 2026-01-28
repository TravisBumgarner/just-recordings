import {
  type AuthResponse,
  createAuthClient,
  type EnrollMfaResponse,
  type GetAssuranceLevelResponse,
  type GetTokenResponse,
  type GetUserResponse,
  type ListMfaFactorsResponse,
  enrollMfa as sharedEnrollMfa,
  getAssuranceLevel as sharedGetAssuranceLevel,
  getToken as sharedGetToken,
  getUser as sharedGetUser,
  listMfaFactors as sharedListMfaFactors,
  login as sharedLogin,
  logout as sharedLogout,
  resetPassword as sharedResetPassword,
  signup as sharedSignup,
  unenrollMfa as sharedUnenrollMfa,
  updatePassword as sharedUpdatePassword,
  verifyMfa as sharedVerifyMfa,
  type UnenrollMfaResponse,
  type VerifyMfaResponse,
} from '@/auth'
import config from '../config'
import { ROUTES } from '../consts'

// Create the Supabase client using shared auth client
export const client = createAuthClient(config.supabaseUrl, config.supabaseAnonKey)

// Re-export types for convenience
export type {
  AuthResponse,
  GetUserResponse,
  GetTokenResponse,
  EnrollMfaResponse,
  VerifyMfaResponse,
  UnenrollMfaResponse,
  ListMfaFactorsResponse,
  GetAssuranceLevelResponse,
}

// Wrap shared functions to use the client
export async function getUser(): Promise<GetUserResponse> {
  return sharedGetUser(client)
}

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return sharedLogin(client, { email, password })
}

export async function signup({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return sharedSignup(client, { email, password })
}

export async function logout(): Promise<AuthResponse> {
  return sharedLogout(client)
}

export async function getToken(): Promise<GetTokenResponse> {
  return sharedGetToken(client)
}

export async function resetPassword(email: string): Promise<AuthResponse> {
  const redirectUrl = `${window.location.origin}${ROUTES.passwordReset.href()}`
  return sharedResetPassword(client, email, redirectUrl)
}

export async function updatePassword(password: string): Promise<AuthResponse> {
  return sharedUpdatePassword(client, password)
}

export async function enrollMfa(friendlyName?: string): Promise<EnrollMfaResponse> {
  return sharedEnrollMfa(client, friendlyName)
}

export async function verifyMfa(factorId: string, code: string): Promise<VerifyMfaResponse> {
  return sharedVerifyMfa(client, factorId, code)
}

export async function unenrollMfa(factorId: string): Promise<UnenrollMfaResponse> {
  return sharedUnenrollMfa(client, factorId)
}

export async function listMfaFactors(): Promise<ListMfaFactorsResponse> {
  return sharedListMfaFactors(client)
}

export async function getAssuranceLevel(): Promise<GetAssuranceLevelResponse> {
  return sharedGetAssuranceLevel(client)
}
