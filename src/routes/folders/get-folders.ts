import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const getFoldersRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/folders', { preHandler: authenticate }, async () => {
    const results = await db
      .select({
        id: schema.folders.id,
        name: schema.folders.name,
        color: schema.folders.color,
      })
      .from(schema.folders)
      .orderBy(schema.folders.createdAt)

    return results
  })
}
