import { useState, useCallback } from 'react'

const AUTO_UPLOAD_KEY = 'just-recordings-auto-upload'

export interface UseAutoUploadSettingReturn {
  autoUploadEnabled: boolean
  setAutoUploadEnabled: (enabled: boolean) => void
}

export function useAutoUploadSetting(): UseAutoUploadSettingReturn {
  const [autoUploadEnabled, setAutoUploadEnabledState] = useState(() => {
    // TODO: implement - default to true
    return true
  })

  const setAutoUploadEnabled = useCallback((enabled: boolean) => {
    // TODO: implement - persist to localStorage
  }, [])

  return {
    autoUploadEnabled,
    setAutoUploadEnabled,
  }
}
