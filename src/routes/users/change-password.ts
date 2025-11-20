import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'
import { comparePassword, hashPassword } from '../../utils/hash.ts'

export const changePasswordRoute: FastifyPluginCallbackZod = (app) => {
  app.patch(
    '/users/me/password',
    {
      preHandler: authenticate,
      schema: {
        tags: ['users'],
        description: 'Change user password',
        body: z.object({
          oldPassword: z.string().min(1),
          newPassword: z.string().min(6),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.user as { id: string }
      const { oldPassword, newPassword } = request.body

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))

      if (!user) {
        return reply.status(401).send({ message: 'User not found' })
      }

      const isPasswordValid = await comparePassword(oldPassword, user.passwordHash)

      if (!isPasswordValid) {
        return reply.status(401).send({ message: 'Invalid old password' })
      }

      const hashedPassword = await hashPassword(newPassword)

      await db
        .update(schema.users)
        .set({
          passwordHash: hashedPassword,
        })
        .where(eq(schema.users.id, id))

      return reply.status(200).send({
        message: 'Password updated successfully',
      })
    }
  )
}
