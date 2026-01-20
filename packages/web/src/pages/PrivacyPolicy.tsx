import Typography from '@mui/material/Typography'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'

const Privacy = () => {
  return (
    <PageWrapper width="full" staticContent>
      <PageTitle text="Privacy Policy" />
      <Typography variant="body1">
        <em>Last updated: Coming Soon</em>
      </Typography>
    </PageWrapper>
  )
}

export default Privacy
