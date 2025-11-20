import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest'
import { app } from '../src/app.ts'
import { db } from '../src/db/connection.ts'
import { schema } from '../src/db/index.ts'

// Mock services
vi.mock('../src/services/media.ts', () => ({
  processMediaFile: vi.fn().mockImplementation(async (buffer, mimeType) => {
    return {
      audioBuffer: Buffer.from('mock-audio'),
      mimeType: 'audio/mpeg',
      wasConverted: false,
    }
  }),
}))

vi.mock('../src/services/gemini.ts', () => ({
  transcribeAudio: vi.fn().mockResolvedValue('Mock Transcription'),
  summarizeTranscription: vi.fn().mockResolvedValue({
    title: 'Mock Title',
    summary: 'Mock Summary',
  }),
}))

describe('Upload Routes', () => {
  let token: string
  const userEmail = `test-upload-${Date.now()}@example.com`
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
  })

  it('should upload valid audio file', async () => {
    const formData = new FormData()
    const file = new Blob(['dummy content'], { type: 'audio/mpeg' })
    formData.append('file', file, 'test.mp3')

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: formData,
    })

    expect(response.statusCode).toBe(201)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('noteId')
  })

  it('should fail if file is too large', async () => {
    const largeContent = new Array(77 * 1024).fill('a').join('') // > 76KB
    const formData = new FormData()
    const file = new Blob([largeContent], { type: 'audio/mpeg' })
    formData.append('file', file, 'large.mp3')

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: formData,
    })

    expect(response.statusCode).toBe(400)
    const body = JSON.parse(response.body)
    expect(body.message).toContain('File too large')
  })

  it('should fail if no file is provided', async () => {
    const formData = new FormData()
    // No file appended

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: formData,
    })

    expect(response.statusCode).toBe(400)
  })
})
