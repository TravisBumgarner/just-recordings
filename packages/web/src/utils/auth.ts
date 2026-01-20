import { z } from 'zod'
import { MINIMUM_PASSWORD_LENGTH } from '../consts'

// Base schemas for reusability
const emailField = z.email('Please enter a valid email address')
const passwordField = z
  .string()
  .min(
    MINIMUM_PASSWORD_LENGTH,
    `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters`
  )

// Simple schemas
export const emailSchema = z.object({
  email: emailField,
})

// Password confirmation schemas with refinement
const passwordWithConfirmationSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const signupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Utility functions for validation
export const validateEmail = (email: string) => emailSchema.safeParse({ email })

export const validatePassword = (password: string, confirmPassword: string) =>
  passwordWithConfirmationSchema.safeParse({ password, confirmPassword })

export const validateSignup = (
  email: string,
  password: string,
  confirmPassword: string
) => signupSchema.safeParse({ email, password, confirmPassword })

// Utility to extract the first error message from Zod validation result
export const getValidationError = (result: {
  success: false
  error: z.ZodError
}): string => result.error.issues[0]?.message || 'Validation failed'
