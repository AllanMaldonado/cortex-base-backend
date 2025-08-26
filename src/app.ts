import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { registerPlugins } from './plugins/index.ts'
import { registerRoutes } from './routes/index.ts'

export const app = fastify({
  logger: { level: 'info' },
}).withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

registerPlugins(app)

registerRoutes(app, { prefix: '/api/v1' })

app.setErrorHandler((err, req, reply) => {
  req.log.error({ err }, 'unhandled_error')
  const status = err.statusCode ?? 500
  const message = status >= 500 ? 'Internal server error' : err.message
  reply.code(status).send({ error: { message } })
})
