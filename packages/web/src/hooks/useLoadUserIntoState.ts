import { useEffect } from 'react'
import { client } from '../services/supabase'
import { loadUserIntoState } from '../utils/loadUserIntoState'

const useLoadUserIntoState = () => {
  useEffect(() => {
    loadUserIntoState()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadUserIntoState()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])
}

export default useLoadUserIntoState
