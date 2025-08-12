import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { hashPassword } from '../../utils/hash.ts'

export const registerRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/auth/register',
    {
      schema: {
        body: z.object({
          name: z.string(),
          email: z.email('E-mail inválido'),
          password: z
            .string()
            .min(6, 'A senha deve ter no mínimo 6 caracteres'),
        }),
      },
    },
    async (req, res) => {
      const { name, email, password } = req.body

      const [existingUser] = await db
        .select({ email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.email, email))

      if (existingUser) {
        return res.status(409).send({ message: 'User already exists' })
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
        return res.status(500).send({ message: 'error creating user' })
      }

      const token = app.jwt.sign({
        id: insertedUser.id,
        email: insertedUser.email,
      })

      return res.status(200).send({
        token,
        user: {
          id: insertedUser.id,
          name: insertedUser.name,
          email: insertedUser.email,
        },
      })
    }
  )
}
