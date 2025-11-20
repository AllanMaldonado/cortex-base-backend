import { describe, expect, it } from 'vitest'
import { app } from '../src/app.ts'

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const user = {
      name: 'teste',
      email: `teste-${Date.now()}@gmail.com`,
      password: '123456',
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: user,
    })

    expect(response.statusCode).toBe(200)

    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('user')
  })
})
