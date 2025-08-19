import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { processTranscription, transcribeAudio } from '../../services/gemini.ts'
import { processMediaFile } from '../../services/media.ts'
import { authenticate } from '../../middleware/authenticate.ts'

export const createNoteRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/notes',
    {
      preHandler: authenticate,
      schema: {
        querystring: z.object({
          folderId: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { folderId } = request.query
      const { id: userId } = request.user
      const file = await request.file()

      if (!file) {
        throw new Error('File is required')
      }

      const fileBuffer = await file.toBuffer()

      const { audioBuffer, mimeType } = await processMediaFile(
        fileBuffer,
        file.mimetype
      )

      const transcription = await transcribeAudio(audioBuffer, mimeType)

      const { summary, title } = await processTranscription(transcription)
      
      const result = await db
        .insert(schema.notes)
        .values({
          title,
          summary,
          transcription,
          userId,
          folderId: folderId ?? null,
        })
        .returning()

      const note = result[0]

      if (!note) {
        throw new Error('Failed to create note')
      }

      return reply.status(201).send({ noteId: note.id })
    }
  )
}
