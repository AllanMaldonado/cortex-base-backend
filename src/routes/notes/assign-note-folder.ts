import { and, eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const assignNoteFolderRoute: FastifyPluginCallbackZod = (app) => {
  app.patch(
    '/notes/:noteId/assign-folder',
    {
      preHandler: authenticate,
      schema: {
        tags: ['notes'],
        description: 'Assign folder to note',
        params: z.object({
          noteId: z
            .string()
            .min(1, 'Note ID is required')
            .pipe(z.uuid('Invalid note ID format')),
        }),
        body: z.object({
          folderId: z.string().nullable(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            assignment: z.object({
              id: z.string(),
              title: z.string(),
              summary: z.string(),
              createdAt: z.string(),
              folderId: z.string().nullable(),
            }),
          }),
          404: z.object({
            message: z.string().describe('Error message for folder not found'),
          }),
          500: z.object({
            message: z
              .string()
              .describe('Error message for failed to assign folder to note'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { noteId } = request.params
      const { folderId } = request.body

      const [assignment] = await db
        .update(schema.notes)
        .set({ folderId })
        .where(
          and(eq(schema.notes.id, noteId), eq(schema.notes.userId, userId))
        )
        .returning()

      if (!assignment) {
        return reply.status(500).send({
          message: 'Failed to assign folder to note',
        })
      }

      return reply.status(200).send({
        message: 'Folder assigned to note successfully',
        assignment: {
          id: assignment.id,
          title: assignment.title,
          summary: assignment.summary,
          createdAt: assignment.createdAt.toISOString(),
          folderId,
        },
      })
    }
  )
}
