import {
  type AuthResponse,
  createAuthClient,
  type GetTokenResponse,
  type GetUserResponse,
  getToken as sharedGetToken,
  getUser as sharedGetUser,
  login as sharedLogin,
  logout as sharedLogout,
  resetPassword as sharedResetPassword,
  signup as sharedSignup,
  updatePassword as sharedUpdatePassword,
} from '@/auth'
import config from '../config'
import { ROUTES } from '../consts'

// Create the Supabase client using shared auth client
export const client = createAuthClient(config.supabaseUrl, config.supabaseAnonKey)

// Re-export types for convenience
export type { AuthResponse, GetUserResponse, GetTokenResponse }

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
