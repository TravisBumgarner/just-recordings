import ContactForm from '../sharedComponents/ContactForm'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'

const Feedback = () => {
  return (
    <PageWrapper minHeight verticallyAlign width="small" staticContent>
      <PageTitle text="Feedback" />
      <ContactForm formSuffix="feedback" />
    </PageWrapper>
  )
}

export default Feedback
