import Typography from '@mui/material/Typography'
import ContactForm from '../sharedComponents/ContactForm'
import PageWrapper from '../styles/shared/PageWrapper'

const Error500 = () => {
  return (
    <PageWrapper minHeight verticallyAlign width="small" staticContent>
      <Typography variant="h2">Something went wrong</Typography>
      <Typography>What were you trying to do?</Typography>
      <ContactForm formSuffix="error500" />
    </PageWrapper>
  )
}

export default Error500
