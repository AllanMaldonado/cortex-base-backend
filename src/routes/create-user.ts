import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../db/connection.ts'
import { schema } from '../db/index.ts'
import { hashPassword } from '../utils/hash.ts'

export const createUserRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/user',
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.email(),
          password: z.string().min(6),
        }),
      },
    },
    async (req, res) => {
      const { name, email, password } = req.body

      const userExists = await db
        .select({ email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.email, email))

      if (userExists.length > 0) {
        throw new Error('User already exists')
      }

      const hashedPassword = await hashPassword(password)

      const result = await db
        .insert(schema.users)
        .values({
          name,
          email,
          password: hashedPassword,
        })
        .returning()

      const insertedUser = result[0]

      if (!insertedUser) {
        throw new Error('User already exists')
      }

      return res.status(201).send({ userId: insertedUser.id })
    }
  )
}
