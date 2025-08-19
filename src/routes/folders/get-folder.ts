import { and, desc, eq } from 'drizzle-orm'
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
    async (req, res) => {
      const { id: userId } = req.user
      const { folderId } = req.params

      const result = await db
        .select({
          id: schema.folders.id,
          name: schema.folders.name,
          color: schema.folders.color,
        })
        .from(schema.folders)
        .where(and(
          eq(schema.folders.id, folderId),
          eq(schema.folders.userId, userId)
        ))
        .orderBy(desc(schema.folders.createdAt))

      if (result.length === 0) {
        return res.status(404).send({ message: 'Folder not found' })
      }

      return result[0] 
    }
  )
}
