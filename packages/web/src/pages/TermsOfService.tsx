import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'

const TermsOfService = () => {
  return (
    <PageWrapper width="full" staticContent>
      <PageTitle text="Terms of Service" />
      <Typography variant="body2">
        <em>Last updated: January 27, 2026</em>
      </Typography>

      <Box>
        <Typography variant="h3">1. Service Description</Typography>
        <Typography variant="body1">
          Just Recordings is a web and desktop application that allows users to record, store, and
          share screen recordings and video content. By using our service, you agree to be bound by
          these Terms of Service.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">2. Account Terms</Typography>
        <Typography variant="body1">
          You must provide accurate and complete information when creating an account. You are
          responsible for maintaining the security of your account credentials. You must be at least
          13 years of age to use this service. You are responsible for all activity that occurs
          under your account.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">3. Acceptable Use</Typography>
        <Typography variant="body1">
          You agree not to use the service to upload, record, or share content that is unlawful,
          harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. You may
          not use the service to violate any applicable laws or regulations. You may not attempt to
          gain unauthorized access to the service or its related systems.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">4. User Content</Typography>
        <Typography variant="body1">
          You retain ownership of all content you create, upload, or record using the service. By
          using the service, you grant us a limited license to store and deliver your content as
          necessary to operate the service. You are solely responsible for the content you create
          and share through the service.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">5. Service Availability</Typography>
        <Typography variant="body1">
          We strive to maintain consistent availability of the service but do not guarantee
          uninterrupted access. The service may be temporarily unavailable due to maintenance,
          updates, or circumstances beyond our control. We reserve the right to modify or
          discontinue features of the service with reasonable notice.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">6. Limitation of Liability</Typography>
        <Typography variant="body1">
          The service is provided &ldquo;as is&rdquo; without warranties of any kind, either express
          or implied. We shall not be liable for any indirect, incidental, special, consequential,
          or punitive damages arising from your use of the service. Our total liability shall not
          exceed the amount you have paid us in the twelve months preceding the claim.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">7. Termination</Typography>
        <Typography variant="body1">
          You may close your account at any time by contacting us. We reserve the right to suspend
          or revoke your access to the service if you violate these terms. Upon account closure,
          your right to use the service will immediately cease. We may retain your data for a
          reasonable period as required by law.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">8. Contact Information</Typography>
        <Typography variant="body1">
          If you have any questions about these Terms of Service, please contact us through the
          feedback page on our website.
        </Typography>
      </Box>
    </PageWrapper>
  )
}

export default TermsOfService
