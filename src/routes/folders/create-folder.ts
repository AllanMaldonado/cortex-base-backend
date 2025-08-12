import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const createFolderRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/folders',
    {
      preHandler: authenticate,
      schema: {
        body: z.object({
          name: z.string().min(1),
          color: z.string().optional(),
        }),
      },
    },
    async (req, res) => {
        const {name, color} = req.body

        const result = await db.
        insert(schema.folders)
        .values({
            name,
            color
        })
        .returning()

        const insertedFolder = result[0]

        if(!insertedFolder){
            throw new Error('Failed to create new room')
        }

        return res.status(201).send({folderId: insertedFolder.id})
    }
  )
}
