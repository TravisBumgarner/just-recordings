import { useState, useCallback } from 'react'

const AUTO_UPLOAD_KEY = 'just-recordings-auto-upload'

export interface UseAutoUploadSettingReturn {
  autoUploadEnabled: boolean
  setAutoUploadEnabled: (enabled: boolean) => void
}

export function useAutoUploadSetting(): UseAutoUploadSettingReturn {
  const [autoUploadEnabled, setAutoUploadEnabledState] = useState(() => {
    const stored = localStorage.getItem(AUTO_UPLOAD_KEY)
    // Default to true if no value is stored
    return stored === null ? true : stored === 'true'
  })

  const setAutoUploadEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(AUTO_UPLOAD_KEY, enabled ? 'true' : 'false')
    setAutoUploadEnabledState(enabled)
  }, [])

  return {
    autoUploadEnabled,
    setAutoUploadEnabled,
  }
}
