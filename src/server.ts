import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './config/env.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

//plugins (falta: fastifyJwt & fastifySwagger)
app.register(fastifyCors, { origin: 'http://localhost:5173' })
app.register(fastifyMultipart)

//rotas
app.get('/health', () => 'OK')

//run
app.listen({ port: env.PORT })
