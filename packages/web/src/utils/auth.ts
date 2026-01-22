// Re-export validation functions from shared package
export {
  emailSchema,
  getValidationError,
  MINIMUM_PASSWORD_LENGTH,
  signupSchema,
  validateEmail,
  validatePassword,
  validateSignup,
} from '@/auth'
