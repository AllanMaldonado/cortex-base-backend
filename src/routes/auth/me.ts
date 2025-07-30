import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'

export const meRoute: FastifyPluginCallbackZod = (app) => {
    app.addHook('onRequest', async (req, res) => {
        try {
            await req.jwtVerify()
        } catch (error) {
            return res.status(401).send({ error })
        }
    })

    app.get('/auth/me', (req) => {
        return req.user
    })
}
