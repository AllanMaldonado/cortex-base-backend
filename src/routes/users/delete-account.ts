import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const deleteAccountRoute: FastifyPluginCallbackZod = (app) => {
  app.delete(
    '/users/me',
    {
      preHandler: authenticate,
      schema: {
        tags: ['users'],
        description: 'Delete user account',
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.user as { id: string }

      await db.delete(schema.users).where(eq(schema.users.id, id))

      return reply.status(200).send({
        message: 'Account deleted successfully',
      })
    }
  )
}
