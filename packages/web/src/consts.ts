export const ROUTES = {
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
}

export const PAGINATION_SIZE = 10
