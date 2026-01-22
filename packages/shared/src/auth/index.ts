export {
  MINIMUM_PASSWORD_LENGTH,
  emailSchema,
  signupSchema,
  validateEmail,
  validatePassword,
  validateSignup,
  getValidationError,
} from './validation'

export { createAuthClient, type AuthClient } from './client'

export {
  getUser,
  login,
  signup,
  logout,
  getToken,
  resetPassword,
  updatePassword,
  type AuthResponse,
  type GetUserResponse,
  type GetTokenResponse,
  type User,
} from './service'
