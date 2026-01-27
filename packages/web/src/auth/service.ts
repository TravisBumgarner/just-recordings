import type { User } from '@supabase/supabase-js'
import type { AuthClient } from './client'

export type { User }

export type AuthResponse = { success: true; data?: unknown } | { error: string; success: false }

export type GetUserResponse =
  | { user: User | null; success: true }
  | { error: string; success: false }

export type GetTokenResponse =
  | { token: string | undefined; success: true }
  | { message: string; success: false }

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

export async function signInWithGoogle(
  client: AuthClient,
  redirectTo: string,
): Promise<AuthResponse> {
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) {
    return { error: 'Google sign-in failed', success: false }
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
