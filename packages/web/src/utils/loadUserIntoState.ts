import { getMe } from '../api/users'
import { getUser } from '../services/supabase'
import useGlobalStore from '../store'

export const loadUserIntoState = async () => {
  const result = await getUser()
  let success: boolean = false

  const store = useGlobalStore.getState()

  if (result.success && result.user) {
    store.setAuthUser(result.user)
    const userDetails = await getMe()
    if (userDetails.success) {
      store.setAppUser(userDetails)
      success = true
    }
  }

  store.setLoadingUser(false)
  return success
}
