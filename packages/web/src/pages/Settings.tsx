import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '../consts'
import Link from '../sharedComponents/Link'
import useGlobalStore from '../store'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'
import { SPACING } from '../styles/styleConsts'

const Profile = () => {
  const appUser = useGlobalStore((state) => state.appUser)
  const authUser = useGlobalStore((state) => state.authUser)

  if (!appUser || !authUser) {
    return <Navigate to="/" />
  }

  const isEmailAuth =
    !!authUser && !!authUser.identities && authUser.identities[0].provider === 'email'

  const _regDate = new Date(authUser.created_at).toDateString()
  return (
    <PageWrapper width="full" minHeight>
      <PageTitle text="User Settings" marginBottom />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: SPACING.SMALL.PX,
        }}
      >
        <Typography variant="body1">
          <strong>Email:</strong> {appUser.email}
        </Typography>
        {isEmailAuth && (
          <Typography variant="body1">
            <strong>Password:</strong>{' '}
            <Link href={ROUTES.passwordReset.href()}>Change Password</Link>
          </Typography>
        )}
      </Box>
    </PageWrapper>
  )
}

export default Profile
