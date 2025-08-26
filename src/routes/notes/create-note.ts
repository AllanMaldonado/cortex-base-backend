import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod/v4'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { authenticate } from '../../middleware/authenticate.ts'
import {
  summarizeTranscription,
  transcribeAudio,
} from '../../services/gemini.ts'
import { processMediaFile } from '../../services/media.ts'

const MAX_GEMINI_FILE_SIZE = 76 * 1024

export const createNoteRoute: FastifyPluginCallbackZod = (app) => {
  app.post(
    '/notes',
    {
      preHandler: authenticate,
      schema: {
        tags: ['notes'],
        description: 'Create note',
        querystring: z.object({
          folderId: z
            .string()
            .pipe(z.uuid('Invalid folder ID format'))
            .optional(),
        }),
        body: z.object({
          file: z.instanceof(File),
        }),
        response: {
          201: z.object({
            noteId: z.string(),
          }),
          400: z.object({
            message: z.string().describe('Error message for file'),
          }),
          500: z.object({
            message: z
              .string()
              .describe('Error message for failed to create note'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { folderId } = request.query
      const { id: userId } = request.user
      const file = await request.file()

      if (!file) {
        return reply.status(400).send({
          message: 'File is required',
        })
      }

      const fileBuffer = await file.toBuffer()

      if (fileBuffer.length > MAX_GEMINI_FILE_SIZE) {
        return reply.status(400).send({
          message: 'File too large. Max allowed is 76KB for Gemini API.',
        })
      }

      const { audioBuffer, mimeType } = await processMediaFile(
        fileBuffer,
        file.mimetype
      )

      const transcription = await transcribeAudio(audioBuffer, mimeType)

      if (!transcription) {
        return reply.status(500).send({
          message: 'Failed to transcribe audio',
        })
      }

      const summarized = await summarizeTranscription(transcription)

      if (!summarized) {
        return reply.status(500).send({
          message: 'Failed to summarize transcription',
        })
      }

      const result = await db
        .insert(schema.notes)
        .values({
          title: summarized.title,
          summary: summarized.summary,
          transcription,
          userId,
          folderId: folderId ?? null,
        })
        .returning()

      const note = result[0]

      if (!note) {
        return reply.status(500).send({
          message: 'Failed to create note',
        })
      }

      return reply.status(201).send({ noteId: note.id })
    }
  )
}
