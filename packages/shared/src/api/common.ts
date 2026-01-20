import { z } from 'zod'

// Common error response
export const errorResponseSchema = z.object({
  error: z.string(),
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>

// Common success response
export const successResponseSchema = z.object({
  success: z.literal(true),
})

export type SuccessResponse = z.infer<typeof successResponseSchema>
