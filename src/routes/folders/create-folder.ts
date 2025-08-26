import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

export const createFolderRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/folders',
    {
      preHandler: authenticate,
      schema: {
        tags: ['folders'],
        description: 'Create folder',
        body: z.object({
          name: z
            .string()
            .min(1, 'The name must be at least 1 character long.'),
          color: z
            .string()
            .refine((val) => HEX_COLOR_REGEX.test(val), {
              message: 'Color must be a valid hex color',
            })
            .optional(),
        }),
        response: {
          201: z.object({
            folderId: z.string(),
          }),
          500: z.object({
            message: z
              .string()
              .describe('Error message for failed to create folder'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { name, color } = request.body

      const [insertedFolder] = await db
        .insert(schema.folders)
        .values({
          name,
          color,
          userId,
        })
        .returning()

      if (!insertedFolder) {
        return reply.status(500).send({
          message: 'Failed to create folder',
        })
      }

      return reply.status(201).send({ folderId: insertedFolder.id })
    }
  )
}
