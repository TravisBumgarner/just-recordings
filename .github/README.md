# GitHub Actions Setup

## Desktop Release Workflow

The `desktop-release.yml` workflow builds and publishes the Just Recordings desktop app for Windows, macOS, and Linux.

### Triggering a Release

1. Go to **Actions** tab in GitHub
2. Select **Release Desktop App** workflow
3. Click **Run workflow**
4. The workflow will build for all platforms and create a GitHub Release

## Required Secrets

### All Platforms

- `GITHUB_TOKEN` - Automatically provided by GitHub

### macOS Code Signing

The following secrets are required for macOS builds to be signed and notarized:

| Secret | Description |
|--------|-------------|
| `APPLE_CERTIFICATE` | Base64-encoded .p12 certificate (Developer ID Application) |
| `APPLE_CERTIFICATE_PASSWORD` | Password for the .p12 file |
| `APPLE_IDENTITY` | Signing identity (e.g., "Developer ID Application: Your Name (TEAMID)") |
| `APPLE_ID` | Apple ID email for notarization |
| `APPLE_PASSWORD` | App-specific password for notarization |
| `APPLE_TEAM_ID` | Apple Developer Team ID |

## Regenerating the Apple Certificate

If you need to create a new certificate:

1. Open **Keychain Access** on your Mac
2. Go to **Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority**
3. Save the `.certSigningRequest` file to disk
4. Go to https://developer.apple.com/account/resources/certificates
5. Create a new **Developer ID Application** certificate using the CSR
6. Download and double-click the `.cer` file to install it
7. In Keychain Access → Certificates, find the new certificate
8. Right-click → **Export** as .p12 with a password
9. Base64 encode it:
   ```bash
   base64 -i certificate.p12 | pbcopy
   ```
10. Update the `APPLE_CERTIFICATE` and `APPLE_CERTIFICATE_PASSWORD` secrets in GitHub

## Creating an App-Specific Password

For notarization, you need an app-specific password:

1. Go to https://appleid.apple.com/account/manage
2. Sign in with your Apple ID
3. In the **Sign-In and Security** section, select **App-Specific Passwords**
4. Click **Generate an app-specific password**
5. Name it something like "Just Recordings Notarization"
6. Copy the generated password and save it as `APPLE_PASSWORD` secret

## Build Outputs

The workflow produces the following artifacts:

| Platform | Format |
|----------|--------|
| Windows | NSIS installer (.exe) |
| macOS | DMG and ZIP |
| Linux | AppImage and .deb |

All artifacts are uploaded to GitHub Releases automatically.
