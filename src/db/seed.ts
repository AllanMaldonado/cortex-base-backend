import { reset, seed } from 'drizzle-seed'
import { db, sql } from './connection.ts'
import { schema } from './index.ts'

await reset(db, schema)

await seed(db, schema).refine((f) => {
  return {
    users: {
      count: 5,
      columns: {
        name: f.fullName(),
        email: f.email(),
        password: f.string()
      },
    }, 
  }
})

await sql.end()

// biome-ignore lint/suspicious/noConsole: only used in dev
console.log('Database seeded')
