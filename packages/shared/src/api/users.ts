import { z } from 'zod'

// User entity (what API returns)
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  createdAt: z.string(),
})

export type User = z.infer<typeof userSchema>

// GET /api/users/me - Client result (flattened, not nested under "user")
export const getMeResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    id: z.string().uuid(),
    email: z.string().email(),
    displayName: z.string(),
    createdAt: z.string(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
])

export type GetMeResult = z.infer<typeof getMeResultSchema>
