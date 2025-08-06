import { desc, eq, isNull } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'

export const GetFolderNotesRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/folders/:folderId/notes',
    {
      schema: {
        params: z.object({
          folderId: z.string(),
        }),
      },
    },
    async (req) => {
      const { folderId } = req.params
      
      let folder, whereCondition

      if (folderId === 'uncategorized') {
        folder = [{
          id: null,
          name: "Sem pasta",
          color: null,
        }]
        whereCondition = isNull(schema.notes.folderId)
      } else {        
        folder = await db
          .select({
            id: schema.folders.id,
            name: schema.folders.name,
            color: schema.folders.color,
          })
          .from(schema.folders)
          .where(eq(schema.folders.id, folderId))
          .limit(1)

        whereCondition = eq(schema.notes.folderId, folderId)
      }

      const notes = await db
        .select({
          id: schema.notes.id,
          title: schema.notes.title,
          summary: schema.notes.summary,
          createdAt: schema.notes.createdAt,
        })
        .from(schema.notes)
        .where(whereCondition)
        .orderBy(desc(schema.notes.createdAt))

      return {
        folder,
        notes
      }
    }
  )
}
