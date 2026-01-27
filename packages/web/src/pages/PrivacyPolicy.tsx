import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import PageTitle from '../styles/shared/PageTitle'
import PageWrapper from '../styles/shared/PageWrapper'

const Privacy = () => {
  return (
    <PageWrapper width="full" staticContent>
      <PageTitle text="Privacy Policy" />
      <Typography variant="body2">
        <em>Last updated: January 27, 2026</em>
      </Typography>

      <Box>
        <Typography variant="h3">1. Data We Collect</Typography>
        <Typography variant="body1">
          When you use Just Recordings, we collect information you provide directly, such as your
          email address and account details. We also collect usage information automatically,
          including device type, browser type, and interaction patterns with the service.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">2. Recording Storage</Typography>
        <Typography variant="body1">
          Your recordings may be stored locally on your device or uploaded to our cloud
          infrastructure depending on your settings. Cloud-stored content is associated with your
          account and accessible only to you unless you choose to share it. You may delete your
          stored content at any time.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">3. Third-Party Services</Typography>
        <Typography variant="body1">
          We use select external providers for hosting, storage, and authentication. These providers
          process your information only as necessary to deliver the service and are bound by their
          own privacy policies. We do not sell your personal information to any outside parties.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">4. Data Retention</Typography>
        <Typography variant="body1">
          We retain your account information and content for as long as your account is active. If
          you delete your account, we will remove your personal information and content within a
          reasonable period, except where retention is required by law or for legitimate operational
          purposes.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">5. Your Rights</Typography>
        <Typography variant="body1">
          You have the right to access, correct, or delete your personal information at any time.
          You may export your content or close your account through the application. If you have
          questions about your personal information, please contact us through the feedback page.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">6. Cookies</Typography>
        <Typography variant="body1">
          We use essential browser storage mechanisms to maintain your session and preferences. We
          do not use tracking or advertising-related mechanisms. Your browser settings may allow you
          to manage or disable these features.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">7. Children</Typography>
        <Typography variant="body1">
          Just Recordings is not intended for use by anyone under the age of 13. We do not knowingly
          collect personal information from minors. If we become aware that a minor has provided us
          with personal information, we will take steps to delete it promptly.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h3">8. Contact Information</Typography>
        <Typography variant="body1">
          If you have any questions about this Privacy Policy, please contact us through the
          feedback page on our website.
        </Typography>
      </Box>
    </PageWrapper>
  )
}

export default Privacy
