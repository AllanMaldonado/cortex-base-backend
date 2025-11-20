import { describe, expect, it, beforeAll } from 'vitest'
import { app } from '../src/app.ts'
import { db } from '../src/db/connection.ts'
import { schema } from '../src/db/index.ts'
import { eq } from 'drizzle-orm'

describe('Folders Routes', () => {
  let token: string
  let userId: string
  let folderId: string
  const userEmail = `test-folders-${Date.now()}@example.com`
  const userPassword = 'password123'

  beforeAll(async () => {
    await app.ready()

    // Register user
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

  it('should create a folder', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/folders',
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        name: 'My Folder',
        color: '#FF0000',
      },
    })
    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    folderId = body.folderId
    expect(folderId).toBeDefined()
  })

  it('should update a folder', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/v1/folders/${folderId}`,
      headers: { Authorization: `Bearer ${token}` },
      payload: {
        name: 'Updated Folder Name',
        color: '#00FF00',
      },
    })
    expect(response.statusCode).toBe(200)
    
    const [updatedFolder] = await db.select().from(schema.folders).where(eq(schema.folders.id, folderId))
    expect(updatedFolder.name).toBe('Updated Folder Name')
    expect(updatedFolder.color).toBe('#00FF00')
  })

  it('should list notes in a folder', async () => {
    await db.insert(schema.notes).values({
      title: 'Note in Folder',
      summary: 'Summary',
      transcription: 'Transcription',
      userId: userId,
      folderId: folderId,
    })

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/folders/${folderId}/notes`,
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.notes).toHaveLength(1)
    expect(body.notes[0].title).toBe('Note in Folder')
  })

  it('should delete a folder', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/v1/folders/${folderId}`,
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.statusCode).toBe(204)

    const [deletedFolder] = await db.select().from(schema.folders).where(eq(schema.folders.id, folderId))
    expect(deletedFolder).toBeUndefined()

    // Check if note was unassigned (folderId set to null)
    const [note] = await db.select().from(schema.notes).where(eq(schema.notes.title, 'Note in Folder'))
    expect(note.folderId).toBeNull()
  })

  it('should not access another user\'s folder', async () => {
    // Create another user
    const otherUserEmail = `other-folder-${Date.now()}@example.com`
    const otherUserResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Other User Folder',
        email: otherUserEmail,
        password: 'password123',
      },
    })
    const otherToken = JSON.parse(otherUserResponse.body).token

    // Create a folder for the first user
    const [folder] = await db.insert(schema.folders).values({
      name: 'User 1 Folder',
      userId: userId,
    }).returning()

    // Try to update it as other user
    const updateResponse = await app.inject({
      method: 'PUT',
      url: `/api/v1/folders/${folder.id}`,
      headers: { Authorization: `Bearer ${otherToken}` },
      payload: { name: 'Hacked Folder' },
    })
    expect(updateResponse.statusCode).toBe(404)

    // Try to delete it as other user
    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/folders/${folder.id}`,
      headers: { Authorization: `Bearer ${otherToken}` },
    })
    expect(deleteResponse.statusCode).toBe(404)
  })
})
