import { describe, expect, it, beforeAll } from 'vitest'
import { app } from '../src/app.ts'
import { db } from '../src/db/connection.ts'
import { schema } from '../src/db/index.ts'
import { eq } from 'drizzle-orm'

describe('User Routes', () => {
  let token: string
  let userId: string
  const userEmail = `test-user-${Date.now()}@example.com`
  const userPassword = 'password123'

  beforeAll(async () => {
    await app.ready() 
  })

  it('should register a user and get token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Test User',
        email: userEmail,
        password: userPassword,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    token = body.token
    userId = body.user.id
    expect(token).toBeDefined()
  })

  it('should update user profile', async () => {
    const newName = 'Updated Name'
    const response = await app.inject({
      method: 'PUT',
      url: '/api/v1/users/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        name: newName,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.user.name).toBe(newName)
    expect(body.user.email).toBe(userEmail)
  })

  it('should change user password', async () => {
    const newPassword = 'newpassword123'
    const response = await app.inject({
      method: 'PATCH',
      url: '/api/v1/users/me/password',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        oldPassword: userPassword,
        newPassword: newPassword,
      },
    })

    expect(response.statusCode).toBe(200)
    
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: userEmail,
        password: newPassword,
      },
    })
    expect(loginResponse.statusCode).toBe(200)
  })

  it('should delete user account', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/api/v1/users/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
    })
    expect(user).toBeUndefined()
  })
})
