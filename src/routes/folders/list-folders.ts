import { desc, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const listFoldersRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/folders',
    {
      preHandler: authenticate,
      schema: {
        tags: ['folders'],
        description: 'List folders',
        response: {
          200: z.object({
            message: z.string(),
            folders: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                color: z.string().nullable(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user

      const folders = await db
        .select({
          id: schema.folders.id,
          name: schema.folders.name,
          color: schema.folders.color,
        })
        .from(schema.folders)
        .where(eq(schema.folders.userId, userId))
        .orderBy(desc(schema.folders.createdAt))

      return reply.status(200).send({
        message: 'Folders retrieved successfully',
        folders,
      })
    }
  )
}
