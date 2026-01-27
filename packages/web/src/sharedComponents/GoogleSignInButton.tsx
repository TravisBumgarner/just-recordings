import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { signInWithGoogle } from '../services/supabase'

const GoogleSignInButton = ({ text }: { text: string }) => {
  const [error, setError] = useState<string | null>(null)

  const handleClick = useCallback(async () => {
    setError(null)
    const response = await signInWithGoogle()
    if (!response.success) {
      setError(response.error)
    }
  }, [])

  return (
    <>
      <Button variant="outlined" fullWidth onClick={handleClick}>
        {text}
      </Button>
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
    </>
  )
}

export default GoogleSignInButton
