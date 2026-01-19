import { z } from 'zod'
import { API_BASE_URL } from './config';

import { getToken } from '../services/supabase'

const zodResponse = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    permissionLevel: z.number(),
    displayName: z.string(),
    email: z.string(),
    id: z.string(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
])

export const getMe = async () => {
  const tokenResponse = await getToken()

  if (!tokenResponse.success)
    return {
      success: false,
      error: 'No token',
    } as const


  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResponse.token}`,
    },
  })

  const json = await response.json()

  console.log('getMe response:', json);

  return zodResponse.parse(json)
}
