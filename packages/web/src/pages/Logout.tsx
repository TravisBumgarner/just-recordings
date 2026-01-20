import Typography from '@mui/material/Typography'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/supabase'
import useGlobalStore from '../store'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'

export default function Logout() {
  const navigate = useNavigate()
  const setAuthUser = useGlobalStore((state) => state.setAuthUser)
  const setAppUser = useGlobalStore((state) => state.setAppUser)
  const setLoadingUser = useGlobalStore((state) => state.setLoadingUser)

  useEffect(() => {
    const logoutUser = async () => {
      setLoadingUser(true)
      const response = await logout()
      if (response?.success) {
        navigate('/')
      }

      setAuthUser(null)
      setAppUser(null)

      // There's flickering that goes on which navigates `/` -> `/login` -> `/` when logging out while on a
      // protected route. The timeout gives a tick to the event loop, allowing the redirect to
      // complete before we hide the loading state.
      setTimeout(() => setLoadingUser(false), 50) // Give some time for the redirect to happen
    }
    logoutUser()
  }, [navigate, setAuthUser, setAppUser, setLoadingUser])

  return (
    <PageWrapper width="small">
      <PageTitle center text="Signing out..." />
      <Typography style={{ textAlign: 'center' }}>See you soon!</Typography>
    </PageWrapper>
  )
}
