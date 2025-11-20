import { describe, expect, it } from 'vitest'
import { app } from '../src/app.ts'

describe('Auth Routes', () => {
  const user = {
    name: 'teste',
    email: `teste-${Date.now()}@gmail.com`,
    password: 'password123',
  }

  it('should register a new user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: user,
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('user')
    expect(body.user.email).toBe(user.email)
  })

  it('should not register with duplicate email', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: user,
    })

    expect(response.statusCode).toBe(409)
  })

  it('should not register with weak password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Weak Password',
        email: `weak-${Date.now()}@gmail.com`,
        password: '123',
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should login successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: user.email,
        password: user.password,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body).toHaveProperty('token')
  })

  it('should not login with incorrect password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: user.email,
        password: 'wrongpassword',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should not access protected route with invalid token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
