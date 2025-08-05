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
import { createNoteRoute } from './routes/notes/create-note.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

//plugins (fastifySwagger)
app.register(fastifyCors, { origin: 'http://localhost:5173' })
app.register(fastifyMultipart, {
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for video files
    files: 1,
    fieldNameSize: 100,
    fieldSize: 1024 * 1024,
    fields: 10,
    headerPairs: 2000,
  },
})
app.register(fastifyJwt, {
  secret: env.SECRET_KEY,
  sign: {
    expiresIn: '7d',
  },
})

//rotas
app.get('/health', () => 'OK')
app.register(loginRoute, { prefix: '/api/v1' })
app.register(registerRoute, { prefix: '/api/v1' })
app.register(meRoute, { prefix: '/api/v1' })
app.register(createNoteRoute, { prefix: '/api/v1' })

//run
app.listen({ port: env.PORT })
