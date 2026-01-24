import { useState, useCallback } from 'react'

const SETUP_COMPLETE_KEY = 'just-recordings-setup-complete'

export interface UseSetupStatusReturn {
  isSetupComplete: boolean
  markSetupComplete: () => void
}

export function useSetupStatus(): UseSetupStatusReturn {
  const [isSetupComplete, setIsSetupComplete] = useState(() => {
    return localStorage.getItem(SETUP_COMPLETE_KEY) === 'true'
  })

  const markSetupComplete = useCallback(() => {
    localStorage.setItem(SETUP_COMPLETE_KEY, 'true')
    setIsSetupComplete(true)
  }, [])

  return {
    isSetupComplete,
    markSetupComplete,
  }
}
