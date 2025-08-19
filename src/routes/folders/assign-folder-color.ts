import { and, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const assignFolderColorRoute: FastifyPluginCallbackZod = (app) => {
  app.patch(
    '/folders/:folderId',
    {
      preHandler: authenticate,
      schema: {
        params: z.object({
          folderId: z.string(),
        }),
        body: z.object({
          color: z.string(),
        }),
      },
    },
    async (req, res) => {
      const { id: userId } = req.user
      const { folderId } = req.params
      const { color } = req.body

      const result = await db
        .update(schema.folders)
        .set({ color })
        .where(and(
          eq(schema.folders.id, folderId),
          eq(schema.folders.userId, userId)
        ))

      const assignment = result[0]

      return res.status(200).send({ assignment })
    }
  )
}
