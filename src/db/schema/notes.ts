import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { folders } from './folders.ts'

/** Futuramente:
 * - Criar tabela a parte (audioChunks), com noteId, transcription, summary, initialTime e endTime
 * - O audio vai ser dividio em chuncks por parte do video e seu topico resumido (0:00 ate 3:02 tem a intro por exemplo)
 * - em notes vai ter apenas o atributo summary que vai juntar tudo de todos os topicos de forma
 *
 */

export const notes = pgTable('notes', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  summary: text().notNull(),
  transcription: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  folderId: uuid().references(() => folders.id),
})
