import { desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'

export const getNoteRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/notes/:noteId',
    {
      schema: {
        params: z.object({
          noteId: z.string(),
        }),
      },
    },
    async (req) => {
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
        .where(eq(schema.notes.id, noteId))
        .orderBy(desc(schema.notes.createdAt))

      return { result }
    }
  )
}
