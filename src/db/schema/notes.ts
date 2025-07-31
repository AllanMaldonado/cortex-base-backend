import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { folders } from './folders.ts'

export const notes = pgTable('notes', {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  content: text().notNull(),
  trascription: text(),
  createdAt: timestamp().defaultNow().notNull(),
  folderId: uuid()
    .references(() => folders.id)
    .notNull(),
})
