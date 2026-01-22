import { getToken } from '../services/supabase'

export function createTokenGetter(): () => Promise<string | undefined> {
  return async () => {
    const result = await getToken()
    if (result.success) {
      return result.token
    }
    return undefined
  }
}
