import { useEffect, useState } from 'react'
import { checkHealth } from '../api/health'

const useHealthCheck = () => {
  // Optimistically assume healthy until we know otherwise
  const [isHealthy, setIsHealthy] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const runHealthCheck = async () => {
      const result = await checkHealth()
      setIsHealthy(result.success)
      setIsLoading(false)
    }

    runHealthCheck()
  }, [])

  return {
    isHealthy,
    isLoading,
  }
}

export default useHealthCheck
