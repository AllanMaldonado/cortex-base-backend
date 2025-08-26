import { and, desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const getNoteRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/notes/:noteId',
    {
      preHandler: authenticate,
      schema: {
        tags: ['notes'],
        description: 'Get note by ID',
        params: z.object({
          noteId: z.string().pipe(z.uuid('Invalid note ID format')),
        }),
        response: {
          200: z.object({
            message: z.string(),
            note: z.object({
              id: z.string(),
              title: z.string(),
              summary: z.string(),
              createdAt: z.string(),
              folderId: z.string().nullable(),
            }),
          }),
          404: z.object({
            message: z.string().describe('Error message for note not found'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { noteId } = request.params

      const [note] = await db
        .select({
          id: schema.notes.id,
          title: schema.notes.title,
          summary: schema.notes.summary,
          createdAt: schema.notes.createdAt,
          folderId: schema.notes.folderId,
        })
        .from(schema.notes)
        .where(
          and(eq(schema.notes.id, noteId), eq(schema.notes.userId, userId))
        )
        .orderBy(desc(schema.notes.createdAt))
        .limit(1)

      if (!note) {
        return reply.status(404).send({ message: 'Note not found' })
      }

      return reply.status(200).send({
        message: 'Note retrieved successfully',
        note: {
          id: note.id,
          title: note.title,
          summary: note.summary,
          createdAt: note.createdAt.toISOString(),
          folderId: note.folderId,
        },
      })
    }
  )
}
