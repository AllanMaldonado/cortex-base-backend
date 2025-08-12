import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { authenticate } from '../../middleware/authenticate.ts'

export const meRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/auth/me', { preHandler: authenticate }, (req) => {
    return req.user
  })
}
