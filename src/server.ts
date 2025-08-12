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
import { assignFolderColorRoute } from './routes/folders/assign-folder-color.ts'
import { createFolderRoute } from './routes/folders/create-folder.ts'
import { getFolderRoute } from './routes/folders/get-folder.ts'
import { getFolderNotesRoute } from './routes/folders/get-folder-notes.ts'
import { getFoldersRoute } from './routes/folders/get-folders.ts'
import { assignNoteFolderRoute } from './routes/notes/assign-note-folder.ts'
import { createNoteRoute } from './routes/notes/create-note.ts'
import { getNoteRoute } from './routes/notes/get-note.ts'

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

const prefix = '/api/v1'
//rotas
app.get('/health', () => 'OK')
app.register(loginRoute, { prefix })
app.register(registerRoute, { prefix })
app.register(meRoute, { prefix })
app.register(createNoteRoute, { prefix })
app.register(createFolderRoute, { prefix })
app.register(assignNoteFolderRoute, { prefix })
app.register(getFoldersRoute, { prefix })
app.register(getFolderNotesRoute, { prefix })
app.register(assignFolderColorRoute, { prefix })
app.register(getFolderRoute, { prefix })
app.register(getNoteRoute, { prefix })

//run
app.listen({ port: env.PORT })
