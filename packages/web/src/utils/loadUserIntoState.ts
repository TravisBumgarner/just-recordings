import { getMe } from '../api/users'
import { getAssuranceLevel, getUser } from '../services/supabase'
import useGlobalStore from '../store'

export const loadUserIntoState = async () => {
  const result = await getUser()
  let success = false

  const store = useGlobalStore.getState()

  if (result.success && result.user) {
    const aalResponse = await getAssuranceLevel()
    if (
      aalResponse.success &&
      aalResponse.currentLevel === 'aal1' &&
      aalResponse.nextLevel === 'aal2'
    ) {
      store.setLoadingUser(false)
      return false
    }

    store.setAuthUser(result.user)
    const userDetails = await getMe()
    if (userDetails.success) {
      store.setAppUser(userDetails.data)
      success = true
    }
  }

  store.setLoadingUser(false)
  return success
}
