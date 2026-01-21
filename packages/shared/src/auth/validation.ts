import { z } from 'zod'

export const MINIMUM_PASSWORD_LENGTH = 10

// Schemas - stubs
export const emailSchema = z.object({
  email: z.string(),
})

export const signupSchema = z.object({
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
})

// Validation functions - stubs
export const validateEmail = (_email: string) => {
  return { success: false, error: { issues: [] } } as z.SafeParseReturnType<{ email: string }, { email: string }>
}

export const validatePassword = (_password: string, _confirmPassword: string) => {
  return { success: false, error: { issues: [] } } as z.SafeParseReturnType<
    { password: string; confirmPassword: string },
    { password: string; confirmPassword: string }
  >
}

export const validateSignup = (_email: string, _password: string, _confirmPassword: string) => {
  return { success: false, error: { issues: [] } } as z.SafeParseReturnType<
    { email: string; password: string; confirmPassword: string },
    { email: string; password: string; confirmPassword: string }
  >
}

export const getValidationError = (result: { success: false; error: z.ZodError }): string => {
  return result.error.issues[0]?.message || 'Validation failed'
}
