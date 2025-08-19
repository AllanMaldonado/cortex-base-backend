import { and, desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const getNoteRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/notes/:noteId',
    {
      preHandler: authenticate,
      schema: {
        params: z.object({
          noteId: z.string(),
        }),
      },
    },
    async (req, res) => {
      const { id: userId } = req.user
      const { noteId } = req.params

      const result = await db
        .select({
          id: schema.notes.id,
          title: schema.notes.title,
          summary: schema.notes.summary,
          createdAt: schema.notes.createdAt,
          folderId: schema.notes.folderId,
        })
        .from(schema.notes)
        .where(and(
          eq(schema.notes.id, noteId),
          eq(schema.notes.userId, userId)
        ))
        .orderBy(desc(schema.notes.createdAt))

      if (result.length === 0) {
        return res.status(404).send({ message: 'Note not found' })
      }

      return result[0]
    }
  )
}
