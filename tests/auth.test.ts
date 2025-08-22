import { describe, expect, it } from 'vitest'
import { app } from '../src/app.ts'

// const hash = (): string => Math.random().toString(10).substring(5)

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const user = {
      name: 'teste',
      email: 'teste3@gmail.com',
      password: '123456'
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: user,
    })

    expect(response.statusCode).toBe(200)

    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('user')
    expect(body).toHaveProperty('token')
  })
})
