import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().startsWith('postgres://'),
  GEMINI_API_KEY: z.string(),
  SECRET_KEY: z.string(),
  CORS_ORIGIN: z.string().optional(),
})

export const env = envSchema.parse(process.env)
