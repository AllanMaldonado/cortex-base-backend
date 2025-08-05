import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'

export const assignFolder: FastifyPluginCallbackZod = (app) => {
  app.patch(
    '/notes/:noteId/assign-folder',
    {
      schema: {
        params: z.object({
          noteId: z.string(),
        }),
        body: z.object({
          folderId: z.string(),
        }),
      },
    },
    async (req, res) => {
      const { noteId } = req.params
      const { folderId } = req.body

      const result = await db
        .update(schema.notes)
        .set({ folderId })
        .where(eq(schema.notes.id, noteId))

      const assignment = result[0]

      return res.status(201).send({ assignment })
    }
  )
}
