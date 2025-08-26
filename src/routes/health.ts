import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'

export const healthRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        description: 'Health check endpoint',
        response: {
          200: z.string().describe('Service status'),
        },
      },
    },
    async () => 'OK'
  )
}
