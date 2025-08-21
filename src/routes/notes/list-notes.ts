import { and, desc, eq, isNull } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const listNotesRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/notes',
    {
      preHandler: authenticate,
      schema: {
        querystring: z
          .object({
            folderId: z.string().optional(),
            uncategorized: z.coerce.boolean().optional(),
          })
          .refine(
            (q) => !(q.folderId && q.uncategorized === true),
            {
              message: 'Use apenas folderId ou uncategorized=true, não ambos.',
            }
          ),
      },
    },
    async (req) => {
      const { id: userId } = req.user
      const { folderId, uncategorized } = req.query as {
        folderId?: string
        uncategorized?: boolean
      }

      const conditions = [eq(schema.notes.userId, userId)]

      if (uncategorized === true) {
        conditions.push(isNull(schema.notes.folderId))
      } else if (folderId) {
        conditions.push(eq(schema.notes.folderId, folderId))
      }
      const whereExpression = conditions.length > 1 ? and(...conditions) : conditions[0]

      const result = await db
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

      return result
    }
  )
}
