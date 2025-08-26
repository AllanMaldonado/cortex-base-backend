import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { authenticate } from '../../middleware/authenticate.ts'

export const meRoute: FastifyPluginCallbackZod = (app) => {
  app.get(
    '/auth/me',
    {
      preHandler: authenticate,
      schema: { tags: ['auth'], description: 'About the user' },
    },
    (request, reply) => {
      return reply.status(200).send(request.user)
    }
  )
}
