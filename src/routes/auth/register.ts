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
        tags: ['auth'],
        description: 'Sign up',
        body: z.object({
          name: z
            .string()
            .min(1, 'The name must be at least 1 character long.'),
          email: z.email('Invalid email'),
          password: z
            .string()
            .min(6, 'The password must be at least 6 characters long'),
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
          409: z.object({
            message: z
              .string()
              .describe('Error message for user data conflicts'),
          }),
          500: z.object({
            message: z
              .string()
              .describe('Error message for failed to create user'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const [existingUser] = await db
        .select({ email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.email, email))

      if (existingUser) {
        return reply.status(409).send({ message: 'User already exists' })
      }

      const hashedPassword = await hashPassword(password)

      const [insertedUser] = await db
        .insert(schema.users)
        .values({
          name,
          email,
          passwordHash: hashedPassword,
        })
        .returning()

      if (!insertedUser) {
        return reply.status(500).send({ message: 'error creating user' })
      }

      const token = app.jwt.sign({
        id: insertedUser.id,
        email: insertedUser.email,
      })

      return reply.status(200).send({
        message: 'User registered successfully',
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
