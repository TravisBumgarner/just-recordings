import { useEffect } from 'react'
import { loadUserIntoState } from '../utils/loadUserIntoState'

const useLoadUserIntoState = () => {
  useEffect(() => {
    loadUserIntoState()
  }, [])
}

export default useLoadUserIntoState
