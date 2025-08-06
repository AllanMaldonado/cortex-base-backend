import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'

export const assignFolderColorRoute: FastifyPluginCallbackZod = (app) => {
  app.patch(
    '/folders/:folderId/assign-color',
    {
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
      const { folderId } = req.params
      const { color } = req.body

      const result = await db
        .update(schema.folders)
        .set({ color })
        .where(eq(schema.folders.id, folderId))

      const assignment = result[0]

      return res.status(201).send({ assignment })
    }
  )
}
