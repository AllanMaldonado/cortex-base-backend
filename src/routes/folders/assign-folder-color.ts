import { and, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

export const assignFolderColorRoute: FastifyPluginCallbackZod = (app) => {
  app.patch(
    '/folders/:folderId',
    {
      preHandler: authenticate,
      schema: {
        tags: ['folders'],
        description: 'Assign color to folder',
        params: z.object({
          folderId: z
            .string()
            .min(1, 'Folder ID is required')
            .pipe(z.uuid('Invalid folder ID format')),
        }),
        body: z.object({
          color: z
            .string()
            .min(1, 'Color is required')
            .refine((val) => HEX_COLOR_REGEX.test(val), {
              message: 'Color must be a valid hex color',
            }),
        }),
        response: {
          200: z.object({
            message: z.string(),
            folder: z.object({
              id: z.string(),
              name: z.string(),
              color: z.string(),
            }),
          }),
          404: z.object({
            message: z.string().describe('Error message for folder not found'),
          }),
          500: z.object({
            message: z
              .string()
              .describe('Error message for failed to assign color to folder'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { folderId } = request.params
      const { color } = request.body

      const [existingFolder] = await db
        .select({ id: schema.folders.id })
        .from(schema.folders)
        .where(
          and(
            eq(schema.folders.id, folderId),
            eq(schema.folders.userId, userId)
          )
        )
        .limit(1)

      if (!existingFolder) {
        return reply.status(404).send({
          message: 'Folder not found',
        })
      }

      const [updatedFolder] = await db
        .update(schema.folders)
        .set({ color })
        .where(
          and(
            eq(schema.folders.id, folderId),
            eq(schema.folders.userId, userId)
          )
        )
        .returning()

      if (!updatedFolder) {
        return reply.status(500).send({
          message: 'Failed to assign color to folder',
        })
      }

      return reply.status(200).send({
        message: 'Folder color assigned successfully',
        folder: {
          id: updatedFolder.id,
          name: updatedFolder.name,
          color,
        },
      })
    }
  )
}
