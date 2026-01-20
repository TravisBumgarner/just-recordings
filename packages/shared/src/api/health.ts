import { z } from 'zod';

// GET /api/health - Server response
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

// GET /api/health - Client wrapper
export const healthResultSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    status: z.enum(['ok', 'error']),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);

export type HealthResult = z.infer<typeof healthResultSchema>;
