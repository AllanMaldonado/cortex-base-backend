import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.ts'

export const folders = pgTable('folders', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  color: text(),
  userId: uuid().references(() => users.id).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
})
