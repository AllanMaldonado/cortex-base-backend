import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { and, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const searchNotesRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/notes/search',
    {
      preHandler: authenticate,
      schema: {
        tags: ['notes'],
        description: 'Search notes',
        querystring: z.object({
          q: z.string().min(1),
        }),
        response: {
          200: z.object({
            message: z.string(),
            notes: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                summary: z.string(),
                createdAt: z.string(),
                folderId: z.string().nullable(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { q } = request.query
      const { id: userId } = request.user

      const notes = await db
        .select({
          id: schema.notes.id,
          title: schema.notes.title,
          summary: schema.notes.summary,
          createdAt: schema.notes.createdAt,
          folderId: schema.notes.folderId,
        })
        .from(schema.notes)
        .where(
          and(
            eq(schema.notes.userId, userId),
            or(
              ilike(schema.notes.title, `%${q}%`),
              ilike(schema.notes.summary, `%${q}%`),
              ilike(schema.notes.transcription, `%${q}%`)
            )
          )
        )
        .orderBy(desc(schema.notes.createdAt))

      return reply.status(200).send({
        message: 'Notes found successfully',
        notes: notes.map((note) => ({
          ...note,
          createdAt: note.createdAt.toISOString(),
        })),
      })
    }
  )
}
