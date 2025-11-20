import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const updateFolderRoute: FastifyPluginCallbackZod = (app) => {
  app.put(
    '/folders/:id',
    {
      preHandler: authenticate,
      schema: {
        tags: ['folders'],
        description: 'Update folder (name and color)',
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().min(1),
          color: z.string().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            folder: z.object({
              id: z.string(),
              name: z.string(),
              color: z.string().nullable(),
              createdAt: z.string(),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { name, color } = request.body
      const { id: userId } = request.user

      const [folder] = await db
        .select()
        .from(schema.folders)
        .where(and(eq(schema.folders.id, id), eq(schema.folders.userId, userId)))

      if (!folder) {
        return reply.status(404).send({ message: 'Folder not found' })
      }

      const [updatedFolder] = await db
        .update(schema.folders)
        .set({
          name,
          color: color ?? null,
        })
        .where(eq(schema.folders.id, id))
        .returning()

      return reply.status(200).send({
        message: 'Folder updated successfully',
        folder: {
          ...updatedFolder,
          createdAt: updatedFolder.createdAt.toISOString(),
        },
      })
    }
  )
}
