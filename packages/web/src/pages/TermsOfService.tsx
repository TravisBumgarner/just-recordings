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
          Just Recordings is a web and desktop application that enables users to record, store, and
          share screen and video recordings. By using the service, you agree to these Terms of
          Service.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">2. Eligibility & Accounts</Typography>
        <Typography variant="body1">
          You must be at least 13 years old to use the service. You agree to provide accurate
          account information and are responsible for all activity under your account. You are
          responsible for maintaining the security of your credentials.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">3. Acceptable Use</Typography>
        <Typography variant="body1">
          You may not use the service to record, upload, or share content that is unlawful,
          infringing, abusive, defamatory, or otherwise objectionable. You are solely responsible
          for ensuring you have all necessary rights and consents to record and share content,
          including compliance with applicable recording and privacy laws. You may not attempt to
          access the service or related systems in an unauthorized manner.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">4. User Content</Typography>
        <Typography variant="body1">
          You retain ownership of all content you create or upload. You grant Just Recordings a
          limited, non-exclusive, revocable license to store, process, and deliver your content
          solely to operate and improve the service. You are solely responsible for your content and
          how it is shared.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">5. Copyright & Takedowns</Typography>
        <Typography variant="body1">
          We respect intellectual property rights and will respond to valid copyright or legal
          takedown requests. Repeated infringement may result in account termination.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">6. Service Availability & Data</Typography>
        <Typography variant="body1">
          The service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We
          do not guarantee uninterrupted access or that recordings will never be lost. You are
          responsible for maintaining backups of your content. We may modify or discontinue features
          at any time with reasonable notice.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">7. Termination & Data Retention</Typography>
        <Typography variant="body1">
          You may close your account at any time. We may suspend or terminate access if you violate
          these terms. Upon termination, access ends immediately. Data may be retained temporarily
          as required by law or for operational purposes, after which it will be deleted.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">8. Limitation of Liability</Typography>
        <Typography variant="body1">
          To the maximum extent permitted by law, Just Recordings shall not be liable for indirect,
          incidental, consequential, or punitive damages. Our total liability shall not exceed the
          amount you paid us in the twelve months preceding the claim.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">9. Changes to Terms</Typography>
        <Typography variant="body1">
          We may update these terms from time to time. Continued use of the service constitutes
          acceptance of the updated terms.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">10. Governing Law</Typography>
        <Typography variant="body1">
          These terms are governed by the laws of the jurisdiction in which Just Recordings
          operates, without regard to conflict of law principles.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">11. Contact</Typography>
        <Typography variant="body1">
          Questions about these terms can be sent via the feedback page on our website.
        </Typography>
      </Box>
    </PageWrapper>
  )
}

export default TermsOfService
