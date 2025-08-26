import { and, desc, eq, isNull } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const listNotesRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/notes',
    {
      preHandler: authenticate,
      schema: {
        tags: ['notes'],
        description: 'List notes',
        querystring: z.object({
          folderId: z
            .string()
            .pipe(z.uuid('Invalid folder ID format'))
            .optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            notes: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                summary: z.string(),
                createdAt: z.string(),
                folderId: z.string().nullable(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const { folderId } = request.query

      const conditions = [eq(schema.notes.userId, userId)]

      if (folderId) {
        conditions.push(eq(schema.notes.folderId, folderId))
      } else {
        conditions.push(isNull(schema.notes.folderId))
      }

      const whereExpression =
        conditions.length > 1 ? and(...conditions) : conditions[0]

      const notes = await db
        .select({
          id: schema.notes.id,
          title: schema.notes.title,
          summary: schema.notes.summary,
          createdAt: schema.notes.createdAt,
          folderId: schema.notes.folderId,
        })
        .from(schema.notes)
        .where(whereExpression)
        .orderBy(desc(schema.notes.createdAt))

      return reply.status(200).send({
        message: 'Notes retrieved successfully',
        notes: notes.map((note) => ({
          ...note,
          createdAt: note.createdAt.toISOString(),
        })),
      })
    }
  )
}
