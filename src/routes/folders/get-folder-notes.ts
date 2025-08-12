import { desc, eq, isNull } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const getFolderNotesRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/folders/:folderId/notes',
    {
      preHandler: authenticate,
      schema: {
        params: z.object({
          folderId: z.string(),
        }),
      },
    },
    async (req) => {
      const { folderId } = req.params

      const whereCondition =
        folderId === 'uncategorized'
          ? isNull(schema.notes.folderId)
          : eq(schema.notes.folderId, folderId)

      const result = await db
        .select({
          id: schema.notes.id,
          title: schema.notes.title,
          summary: schema.notes.summary,
          createdAt: schema.notes.createdAt,
        })
        .from(schema.notes)
        .where(whereCondition)
        .orderBy(desc(schema.notes.createdAt))

      return { result }
    }
  )
}
