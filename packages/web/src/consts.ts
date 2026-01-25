export const ROUTES = {
  downloads: {
    key: 'downloads',
    href: () => '/downloads',
    label: 'Downloads',
  },
  privacy: {
    key: 'privacy',
    href: () => '/privacy',
    label: 'Privacy Policy',
  },
  tos: {
    key: 'tos',
    href: () => '/tos',
    label: 'Terms of Service',
  },
  home: {
    key: 'home',
    href: () => '/',
    label: 'Home',
  },
  login: {
    key: 'login',
    href: () => '/login',
    label: 'Login',
  },
  signup: {
    key: 'signup',
    href: () => '/signup',
    label: 'Signup',
  },
  logout: {
    key: 'logout',
    href: () => '/logout',
    label: 'Logout',
  },
  passwordReset: {
    key: 'passwordReset',
    href: () => '/password_reset',
    label: 'Reset Password',
  },
  settings: {
    key: 'settings',
    href: () => '/settings',
    label: 'Settings',
  },
  releaseNotes: {
    key: 'releasenotes',
    href: () => '/releasenotes',
    label: 'Release Notes',
  },
  error404: {
    key: 'error404',
    href: () => '/error404',
    label: '404 Not Found',
  },
  error500: {
    key: 'error500',
    href: () => '/error500',
    label: '500 Internal Server Error',
  },
  feedback: {
    key: 'feedback',
    href: () => '/feedback',
    label: 'Feedback',
  },
  recordingViewer: {
    key: 'recordingViewer',
    href: (id?: string) => `/recordings/${id || ':id'}`,
    label: 'Recording Viewer',
  },
  uploadQueue: {
    key: 'uploadQueue',
    href: () => '/uploads',
    label: 'Upload Queue',
  },
  floatingControls: {
    key: 'floatingControls',
    href: () => '/floating-controls',
    label: 'Floating Controls',
  },
  sharedRecording: {
    key: 'sharedRecording',
    href: (token?: string) => `/share/${token || ':token'}`,
    label: 'Shared Recording',
  },
}

export const PAGINATION_SIZE = 10

export const APP_VERSION = '0.0.2'

// GitHub release download URLs using the "latest" pattern for stable links
const GITHUB_RELEASE_BASE = 'https://github.com/TravisBumgarner/just-recordings/releases/latest/download'

export const EXTERNAL_LINKS = {
  windows: `${GITHUB_RELEASE_BASE}/Just-Recordings-win32-x64-setup.exe`,
  mac: `${GITHUB_RELEASE_BASE}/Just-Recordings-darwin.dmg`,
  linux: `${GITHUB_RELEASE_BASE}/just-recordings_${APP_VERSION}_amd64.deb`,
}
