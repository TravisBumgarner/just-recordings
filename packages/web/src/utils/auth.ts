// Re-export validation functions from shared package
export {
  MINIMUM_PASSWORD_LENGTH,
  emailSchema,
  signupSchema,
  validateEmail,
  validatePassword,
  validateSignup,
  getValidationError,
} from '@just-recordings/shared/auth'
