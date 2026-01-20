import Typography from '@mui/material/Typography'

import PageWrapper from '../styles/shared/PageWrapper'

import ContactForm from '../sharedComponents/ContactForm'

const Error404 = () => {
  return (
    <PageWrapper minHeight verticallyAlign width="small" staticContent>
      <Typography variant="h2">Not found</Typography>
      <Typography>
        The page you were looking for could not be found. What were you looking for?
      </Typography>
      <ContactForm formSuffix="error404" />
    </PageWrapper>
  )
}

export default Error404
