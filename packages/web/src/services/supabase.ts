import { createClient } from '@supabase/supabase-js'
import config from '../config'
import { ROUTES } from '../consts'
import { logger } from './logging'

type Response =
  | { success: true; data?: unknown }
  | { error: string; success: false }

export const client = createClient(config.supabaseUrl, config.supabaseAnonKey)

export async function getUser() {
  const sessionExists = await client.auth.getSession()

  if (!sessionExists.data.session) {
    return { user: null, success: true }
  }

  const { data, error } = await client.auth.getUser()
  if (error) {
    logger.error(`Get user failed ${JSON.stringify(error)}`)
    return { error: 'Get user failed', success: false }
  }

  return { user: data.user, success: true }
}

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<Response> {
  const { error, data } = await client.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    logger.error(`Login failed ${JSON.stringify(error)}`)
    return { error: 'Login Failed', success: false }
  }

  return { success: true, data }
}

export async function signup({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<Response> {
  const { error } = await client.auth.signUp({ email, password })
  if (error) {
    logger.error(`Signup failed ${JSON.stringify(error)}`)
    return { error: 'Signup failed', success: false }
  }
  return { success: true }
}

export async function logout(): Promise<Response> {
  // Will throw error when logging out a user that has been deleted
  // It does succeed on clearing local storage so on refresh there will be no session stored.
  await client.auth.signOut()
  return { success: true }
}

export async function getToken() {
  const { data, error } = await client.auth.getSession()
  if (error) {
    logger.error(`Get token failed ${JSON.stringify(error)}`)
    return { message: 'Get token failed', success: false }
  }
  return { token: data.session?.access_token, success: true }
}

export async function resetPassword(email: string): Promise<Response> {
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${ROUTES.passwordReset.href}`,
  })
  if (error) {
    logger.error(`Password reset failed ${JSON.stringify(error)}`)
    return { error: 'Failed to send reset email', success: false }
  }
  return { success: true }
}

export async function updatePassword(password: string): Promise<Response> {
  const { error } = await client.auth.updateUser({ password })
  if (error) {
    logger.error(`Password update failed ${JSON.stringify(error)}`)
    return { error: 'Failed to update password', success: false }
  }
  return { success: true }
}

// export async function signInWithGoogle() {
//   try {
//     if (Capacitor.isNativePlatform()) {
//       // Native (iOS/Android)
//       const { data, error } = await client.auth.signInWithOAuth({
//         provider: 'google',
//         options: {
//           redirectTo: NATIVE_AUTH_CALLBACK_URL,
//         },
//       })

//       if (error) {
//         logger.error(`Google sign-in failed (native): ${JSON.stringify(error)}`)
//         return { error: 'Google sign-in failed', success: false }
//       }

//       if (data?.url) {
//         await Browser.open({ url: data.url })
//       }

//       return { success: true }
//     } else {
//       // Browser
//       const { error } = await client.auth.signInWithOAuth({
//         provider: 'google',
//       })

//       if (error) {
//         logger.error(`Google sign-in failed (web): ${JSON.stringify(error)}`)
//         return { error: 'Google sign-in failed', success: false }
//       }

//       return { success: true }
//     }
//   } catch (err) {
//     logger.error(`Unexpected error in Google sign-in: ${err}`)
//     return { error: 'Unexpected error', success: false }
//   }
// }
