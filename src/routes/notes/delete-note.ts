import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const deleteNoteRoute: FastifyPluginCallbackZod = (app) => {
  app.delete(
    '/notes/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['notes'],
        description: 'Delete note',
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          204: z.null(),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { id: userId } = request.user

      const [note] = await db
        .delete(schema.notes)
        .where(and(eq(schema.notes.id, id), eq(schema.notes.userId, userId)))
        .returning()

      if (!note) {
        return reply.status(404).send({ message: 'Note not found' })
      }

      return reply.status(204).send()
    }
  )
}
