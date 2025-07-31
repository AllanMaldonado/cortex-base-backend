import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const folders = pgTable('folders', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  color: text(),
  createdAt: timestamp().defaultNow().notNull(),
})
