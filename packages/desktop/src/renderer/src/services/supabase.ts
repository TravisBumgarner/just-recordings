import {
  createAuthClient,
  getUser as sharedGetUser,
  login as sharedLogin,
  signup as sharedSignup,
  logout as sharedLogout,
  getToken as sharedGetToken,
  resetPassword as sharedResetPassword,
  updatePassword as sharedUpdatePassword,
  type AuthResponse,
  type GetUserResponse,
  type GetTokenResponse,
} from '@just-recordings/shared/auth'
import config from '../config'

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
  // For desktop, redirect to web app for password reset flow
  const redirectUrl = 'http://localhost:5173/password-reset'
  return sharedResetPassword(client, email, redirectUrl)
}

export async function updatePassword(password: string): Promise<AuthResponse> {
  return sharedUpdatePassword(client, password)
}
