import { describe, expect, it, beforeAll } from 'vitest'
import { app } from '../src/app.ts'
import { db } from '../src/db/connection.ts'
import { schema } from '../src/db/index.ts'
import { eq } from 'drizzle-orm'

describe('Database Constraints', () => {
  let token: string
  let userId: string
  let folderId: string
  let noteId: string
  const userEmail = `test-constraints-${Date.now()}@example.com`
  const userPassword = 'password123'

  beforeAll(async () => {
    await app.ready()

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Test User',
        email: userEmail,
        password: userPassword,
      },
    })
    const body = JSON.parse(response.body)
    token = body.token
    userId = body.user.id
  })

  it('should set null to note folderId when folder is deleted', async () => {
    const [folder] = await db.insert(schema.folders).values({
      name: 'Test Folder',
      userId: userId,
    }).returning()
    folderId = folder.id

    const [note] = await db.insert(schema.notes).values({
      title: 'Test Note',
      summary: 'Summary',
      transcription: 'Transcription',
      userId: userId,
      folderId: folderId,
    }).returning()
    noteId = note.id

    await db.delete(schema.folders).where(eq(schema.folders.id, folderId))

    const [updatedNote] = await db.select().from(schema.notes).where(eq(schema.notes.id, noteId))
    expect(updatedNote.folderId).toBeNull()
  })

  it('should cascade delete notes and folders when user is deleted', async () => {
    const [folder] = await db.insert(schema.folders).values({
      name: 'Test Folder 2',
      userId: userId,
    }).returning()

    await db.insert(schema.notes).values({
      title: 'Test Note 2',
      summary: 'Summary 2',
      transcription: 'Transcription 2',
      userId: userId,
    })

    await db.delete(schema.users).where(eq(schema.users.id, userId))

    const [deletedFolder] = await db.select().from(schema.folders).where(eq(schema.folders.id, folder.id))
    expect(deletedFolder).toBeUndefined()

    const [deletedNote] = await db.select().from(schema.notes).where(eq(schema.notes.title, 'Test Note 2'))
    expect(deletedNote).toBeUndefined()
  })
})
