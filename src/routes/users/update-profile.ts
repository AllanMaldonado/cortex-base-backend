import { eq, ne, and } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const updateProfileRoute: FastifyPluginCallbackZod = (app) => {
  app.put(
    '/users/me',
    {
      preHandler: authenticate,
      schema: {
        tags: ['users'],
        description: 'Update user profile',
        body: z.object({
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.user as { id: string; email: string }
      const { name, email } = request.body

      if (email) {
        const [existingUser] = await db
          .select()
          .from(schema.users)
          .where(and(eq(schema.users.email, email), ne(schema.users.id, id)))

        if (existingUser) {
          return reply.status(409).send({ message: 'Email already in use' })
        }
      }

      const [updatedUser] = await db
        .update(schema.users)
        .set({
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
        })
        .where(eq(schema.users.id, id))
        .returning()

      return reply.status(200).send({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      })
    }
  )
}
