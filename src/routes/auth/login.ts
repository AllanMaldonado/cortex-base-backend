import { eq } from 'drizzle-orm'
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/index.ts'
import { comparePassword } from '../../utils/hash.ts'

export const loginRoute: FastifyPluginCallbackZod = (app) => {
    app.post(
        '/auth/login',
        {
            schema: {
                body: z.object({
                    email: z.email('E-mail inválido'),
                    password: z
                        .string()
                        .min(6, 'A senha deve ter no mínimo 6 caracteres'),
                }),
            },
        },
        async (req, res) => {
            const { email, password } = req.body

            const [user] = await db
                .select({
                    id: schema.users.id,
                    email: schema.users.email,
                    password: schema.users.password,
                })
                .from(schema.users)
                .where(eq(schema.users.email, email))
                .limit(1)

            if (!user) {
                return res.status(401).send({ message: 'Invalid Credentials' })
            }

            const isPassword = await comparePassword(password, user.password)

            if (!isPassword) {
                return res.status(401).send({ message: 'Invalid Credentials' })
            }

            const token = app.jwt.sign({
                id: user.id,
                email: user.email,
            })

            return res.status(200).send({ token })
        }
    )
}
