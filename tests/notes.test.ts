import { describe, expect, it, beforeAll } from 'vitest'
import { app } from '../src/app.ts'
import { db } from '../src/db/connection.ts'
import { schema } from '../src/db/index.ts'
import { eq } from 'drizzle-orm'

describe('Notes Routes', () => {
  let token: string
  let userId: string
  let noteId: string
  const userEmail = `test-notes-${Date.now()}@example.com`
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

  it('should create a note directly in db for testing', async () => {
    const [note] = await db.insert(schema.notes).values({
      title: 'Original Title',
      summary: 'Original Summary',
      transcription: 'Original Transcription',
      userId: userId,
    }).returning()
    noteId = note.id
    expect(noteId).toBeDefined()
  })

  it('should update a note', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/v1/notes/${noteId}`,
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        title: 'Updated Title',
        summary: 'Updated Summary',
      },
    })
    expect(response.statusCode).toBe(200)
    
    const [updatedNote] = await db.select().from(schema.notes).where(eq(schema.notes.id, noteId))
    expect(updatedNote.title).toBe('Updated Title')
    expect(updatedNote.summary).toBe('Updated Summary')
    expect(updatedNote.transcription).toBe('Original Transcription')
  })

  it('should search notes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/notes/search?q=Updated',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.notes).toHaveLength(1)
    expect(body.notes[0].title).toBe('Updated Title')
  })

  it('should list notes with pagination and sorting', async () => {
      await db.insert(schema.notes).values({
      title: 'A Second Note',
      summary: 'Summary 2',
      transcription: 'Transcription 2',
      userId: userId,
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/notes?page=1&limit=10&sortBy=title&order=asc',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.notes).toHaveLength(2)
    expect(body.notes[0].title).toBe('A Second Note') 
  })

  it('should delete a note', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/v1/notes/${noteId}`,
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.statusCode).toBe(204)

    const [deletedNote] = await db.select().from(schema.notes).where(eq(schema.notes.id, noteId))
    expect(deletedNote).toBeUndefined()
  })

  it('should not create note without authentication', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      payload: {
        file: 'dummy', // This would fail validation anyway, but auth check comes first
      },
    })
    expect(response.statusCode).toBe(401)
  })

  it('should not access another user\'s note', async () => {
    // Create another user
    const otherUserEmail = `other-${Date.now()}@example.com`
    const otherUserResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Other User',
        email: otherUserEmail,
        password: 'password123',
      },
    })
    const otherToken = JSON.parse(otherUserResponse.body).token

    // Create a note for the first user
    const [note] = await db.insert(schema.notes).values({
      title: 'User 1 Note',
      summary: 'Summary',
      transcription: 'Transcription',
      userId: userId,
    }).returning()

    // Try to get it as other user
    const getResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/notes/${note.id}`,
      headers: { Authorization: `Bearer ${otherToken}` },
    })
    expect(getResponse.statusCode).toBe(404) // Or 403 depending on implementation, usually 404 to hide existence

    // Try to update it as other user
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/v1/notes/${note.id}`,
      headers: { Authorization: `Bearer ${otherToken}` },
      payload: { title: 'Hacked' },
    })
    expect(updateResponse.statusCode).toBe(404)

    // Try to delete it as other user
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/notes/${note.id}`,
      headers: { Authorization: `Bearer ${otherToken}` },
    })
    expect(deleteResponse.statusCode).toBe(404)
  })
})
