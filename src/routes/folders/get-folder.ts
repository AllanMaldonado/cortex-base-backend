import { desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const getFolderRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/folders/:folderId', 
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

      const result = await db
        .select({
          id: schema.folders.id,
          name: schema.folders.name,
          color: schema.folders.color,
        })
        .from(schema.folders)
        .where(eq(schema.folders.id, folderId))
        .orderBy(desc(schema.folders.createdAt))

      return { result }
    }
  )
}
