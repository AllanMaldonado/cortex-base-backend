import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { comparePassword } from '../../utils/hash.ts'

export const loginRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['auth'],
        description: 'Sign in',
        body: z.object({
          email: z.email('Invalid email'),
          password: z
            .string()
            .min(6, 'The password must be at least 6 characters long.'),
        }),
        response: {
          200: z.object({
            message: z.string(),
            token: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          }),
          401: z.object({
            message: z
              .string()
              .describe('Error message for invalid credentials'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const [user] = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          passwordHash: schema.users.passwordHash,
        })
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1)

      if (!user) {
        return reply.status(401).send({ message: 'Invalid Credentials' })
      }

      const isPassword = await comparePassword(password, user.passwordHash)

      if (!isPassword) {
        return reply.status(401).send({ message: 'Invalid Credentials' })
      }

      const token = app.jwt.sign({
        id: user.id,
        email: user.email,
      })

      return reply.status(200).send({
        message: 'User logged in successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
    }
  )
}
