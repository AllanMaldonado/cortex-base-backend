import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './config/env.ts'
import { loginRoute } from './routes/auth/login.ts'
import { meRoute } from './routes/auth/me.ts'
import { registerRoute } from './routes/auth/register.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

//plugins (falta: fastifyJwt & fastifySwagger)
app.register(fastifyCors, { origin: 'http://localhost:5173' })
app.register(fastifyMultipart)
app.register(fastifyJwt, {
  secret: env.SECRET_KEY,
})

//rotas
app.get('/health', () => 'OK')
app.register(loginRoute, { prefix: '/api/v1' })
app.register(registerRoute, { prefix: '/api/v1' })
app.register(meRoute, { prefix: '/api/v1' })

//run
app.listen({ port: env.PORT })
