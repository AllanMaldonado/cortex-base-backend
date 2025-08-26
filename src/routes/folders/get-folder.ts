import { and, desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const getFolderRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/folders/:folderId',
    {
      preHandler: authenticate,
      schema: {
        tags: ['folders'],
        description: 'Get folder by ID',
        params: z.object({
          folderId: z
            .string()
            .min(1, 'Folder ID is required')
            .pipe(z.uuid('Invalid folder ID format')),
        }),
        response: {
          200: z.object({
            message: z.string(),
            folder: z.object({
              id: z.string(),
              name: z.string(),
              color: z.string().nullable(),
            }),
          }),
          404: z.object({
            message: z.string().describe('Error message for folder not found'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { folderId } = request.params

      const [folder] = await db
        .select({
          id: schema.folders.id,
          name: schema.folders.name,
          color: schema.folders.color,
        })
        .from(schema.folders)
        .where(
          and(
            eq(schema.folders.id, folderId),
            eq(schema.folders.userId, userId)
          )
        )
        .orderBy(desc(schema.folders.createdAt))
        .limit(1)

      if (!folder) {
        return reply.status(404).send({ message: 'Folder not found' })
      }

      return reply.status(200).send({
        message: 'Folder retrieved successfully',
        folder: {
          id: folder.id,
          name: folder.name,
          color: folder.color,
        },
      })
    }
  )
}
