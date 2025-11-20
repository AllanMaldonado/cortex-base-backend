import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const updateNoteRoute: FastifyPluginCallbackZod = (app) => {
  app.put(
    '/notes/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['notes'],
        description: 'Update note',
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().min(1).optional(),
          summary: z.string().min(1).optional(),
          transcription: z.string().min(1).optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { title, summary, transcription } = request.body
      const { id: userId } = request.user

      const [note] = await db
        .select()
        .from(schema.notes)
        .where(and(eq(schema.notes.id, id), eq(schema.notes.userId, userId)))

      if (!note) {
        return reply.status(404).send({ message: 'Note not found' })
      }

      await db
        .update(schema.notes)
        .set({
          title: title ?? note.title,
          summary: summary ?? note.summary,
          transcription: transcription ?? note.transcription,
        })
        .where(eq(schema.notes.id, id))

      return reply.status(200).send({ message: 'Note updated successfully' })
    }
  )
}
