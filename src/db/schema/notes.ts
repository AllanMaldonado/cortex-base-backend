import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { folders } from './folders.ts'
import { users } from './users.ts'

export const notes = pgTable(
  'notes',
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    summary: text().notNull(),
    transcription: text().notNull(),
    userId: uuid()
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    folderId: uuid().references(() => folders.id, { onDelete: 'set null' }),
  },
  (table) => {
    return {
      userIdIdx: index('notes_user_id_idx').on(table.userId),
      folderIdIdx: index('notes_folder_id_idx').on(table.folderId),
      createdAtIdx: index('notes_created_at_idx').on(table.createdAt),
    }
  }
)
