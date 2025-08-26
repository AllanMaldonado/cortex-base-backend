import fastifyCors from '@fastify/cors'
import helmet from '@fastify/helmet'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import { env } from '../config/env.ts'
import type { FastifyTypedInstance } from '../types/fastify-instance.d.ts'

export function registerPlugins(app: FastifyTypedInstance) {
  app.register(fastifyCors, {
    origin: env.CORS_ORIGIN?.split(',') ?? false,
    credentials: true,
  })

  app.register(fastifyMultipart, {
    limits: {
      fileSize: 25 * 1024 * 1024,
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
      expiresIn: '1d',
    },
  })

  app.register(helmet)
  app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Cortex Base API',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })

  app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  })
}
