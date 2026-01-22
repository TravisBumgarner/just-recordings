// Stub - to be implemented
import type { AuthResponse, GetTokenResponse, GetUserResponse } from '@just-recordings/shared/auth'

// Re-export types for convenience
export type { AuthResponse, GetUserResponse, GetTokenResponse }

export async function getUser(): Promise<GetUserResponse> {
  return { user: null, success: true }
}

export async function login(_credentials: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return { success: false, error: 'Not implemented' }
}

export async function signup(_credentials: {
  email: string
  password: string
}): Promise<AuthResponse> {
  return { success: false, error: 'Not implemented' }
}

export async function logout(): Promise<AuthResponse> {
  return { success: true }
}

export async function getToken(): Promise<GetTokenResponse> {
  return { token: undefined, success: true }
}

export async function resetPassword(_email: string): Promise<AuthResponse> {
  return { success: false, error: 'Not implemented' }
}

export async function updatePassword(_password: string): Promise<AuthResponse> {
  return { success: false, error: 'Not implemented' }
}
