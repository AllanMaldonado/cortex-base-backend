import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { eq, and, desc, asc, ilike, or } from 'drizzle-orm'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const listFolderNotesRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/folders/:id/notes',
    {
      preHandler: authenticate,
      schema: {
        tags: ['folders'],
        description: 'List notes in a folder',
        params: z.object({
          id: z.string().uuid(),
        }),
        querystring: z.object({
          page: z.coerce.number().min(1).default(1),
          limit: z.coerce.number().min(1).max(100).default(20),
          sortBy: z.enum(['createdAt', 'title']).default('createdAt'),
          order: z.enum(['asc', 'desc']).default('desc'),
          q: z.string().optional(),
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
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { page, limit, sortBy, order, q } = request.query
      const { id: userId } = request.user
      const offset = (page - 1) * limit

      const [folder] = await db
        .select()
        .from(schema.folders)
        .where(and(eq(schema.folders.id, id), eq(schema.folders.userId, userId)))

      if (!folder) {
        return reply.status(404).send({ message: 'Folder not found' })
      }

      const conditions = [
        eq(schema.notes.userId, userId),
        eq(schema.notes.folderId, id),
      ]

      if (q) {
        conditions.push(
          or(
            ilike(schema.notes.title, `%${q}%`),
            ilike(schema.notes.summary, `%${q}%`)
          )!
        )
      }

      const whereExpression = and(...conditions)

      const sortColumn =
        sortBy === 'title' ? schema.notes.title : schema.notes.createdAt
      const sortOrder = order === 'asc' ? asc(sortColumn) : desc(sortColumn)

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
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset)

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
