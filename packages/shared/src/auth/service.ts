import type { AuthClient } from './client'

export type AuthResponse = { success: true; data?: unknown } | { error: string; success: false }

export type GetUserResponse =
  | { user: { id: string; email?: string } | null; success: true }
  | { error: string; success: false }

export type GetTokenResponse = { token: string | undefined; success: true } | { message: string; success: false }

export async function getUser(_client: AuthClient): Promise<GetUserResponse> {
  // Stub
  return { user: null, success: true }
}

export async function login(
  _client: AuthClient,
  _credentials: { email: string; password: string }
): Promise<AuthResponse> {
  // Stub
  return { success: false, error: 'Not implemented' }
}

export async function signup(
  _client: AuthClient,
  _credentials: { email: string; password: string }
): Promise<AuthResponse> {
  // Stub
  return { success: false, error: 'Not implemented' }
}

export async function logout(_client: AuthClient): Promise<AuthResponse> {
  // Stub
  return { success: true }
}

export async function getToken(_client: AuthClient): Promise<GetTokenResponse> {
  // Stub
  return { token: undefined, success: true }
}

export async function resetPassword(
  _client: AuthClient,
  _email: string,
  _redirectUrl: string
): Promise<AuthResponse> {
  // Stub
  return { success: false, error: 'Not implemented' }
}

export async function updatePassword(_client: AuthClient, _password: string): Promise<AuthResponse> {
  // Stub
  return { success: false, error: 'Not implemented' }
}
