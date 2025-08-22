import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgres://')
    .default('postgres://user:pass@localhost:5432/testdb'),
  GEMINI_API_KEY: z.string().default('gemini-key'),
  SECRET_KEY: z.string().default('secret'),
})

export const env = envSchema.parse(process.env)
