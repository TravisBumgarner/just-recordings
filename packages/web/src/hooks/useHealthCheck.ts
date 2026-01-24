import { useHealth } from './queries/useHealth'

const useHealthCheck = () => {
  const { data, isLoading, isError } = useHealth()

  return {
    isHealthy: !isError && !!data,
    isLoading,
  }
}

export default useHealthCheck
