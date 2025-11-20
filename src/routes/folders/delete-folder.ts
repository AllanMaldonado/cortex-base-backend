import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const deleteFolderRoute: FastifyPluginCallbackZod = (app) => {
  app.delete(
    '/folders/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['folders'],
        description: 'Delete folder',
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          204: z.null(),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { id: userId } = request.user

      const [folder] = await db
        .select()
        .from(schema.folders)
        .where(and(eq(schema.folders.id, id), eq(schema.folders.userId, userId)))

      if (!folder) {
        return reply.status(404).send({ message: 'Folder not found' })
      }
      
      await db
        .update(schema.notes)
        .set({ folderId: null })
        .where(eq(schema.notes.folderId, id))

      await db
        .delete(schema.folders)
        .where(eq(schema.folders.id, id))

      return reply.status(204).send()
    }
  )
}
