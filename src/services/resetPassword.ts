import { Context } from "hono";
import { Env } from "..";
import { randomBytes, scryptSync } from "crypto";
import { Document } from "firebase-firestore-lite";
import { createRoute, z } from "@hono/zod-openapi";

export const resetPasswordRoute = createRoute({
    method: 'post',
    path: '/reset-password',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        email: z.string().email(),
                        recoveryToken: z.string().length(32).openapi({ example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
                    })
                }
            }
        }
    },
    responses: {
        200: {
            description: 'Password reset successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal(true),
                        data: z.object({
                            password: z.string().length(16).openapi({ example: 'xxxxxxxxxxxxxxxx' }),
                            recoveryToken: z.string().length(32).openapi({ example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
                        })
                    })
                }
            }
        },
        404: {
            description: 'Email and Recovery Token does not match',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal(false),
                        message: z.string().openapi({ example: 'Email and Recovery Token does not match' })
                    })
                }
            }
        }
    }
})

export async function resetPassword(c: Context<Env, "/reset-password", {
    out: {
        json: {
            email: string;
            recoveryToken: string;
        };
    };
}>) {
    const db = c.var.db.client

    const { email, recoveryToken } = c.req.valid('json')
    const users = db.ref('users')
    const query = users.query({
        select: ['email', 'password'],
        where: [
            ['email', '==', email],
        ],
        limit: 1
    })
    const result: Array<Document> = await query.run()

    if (result.length === 0) {
        return c.json({ status: false, message: 'Email and Recovery Token does not match' }, 404)
    }

    const user = result[0]
    if (user.password.split('$')[0] !== recoveryToken) {
        return c.json({ status: false, message: 'Email and Recovery Token does not match' }, 404)
    }

    const userRef = db.ref(user.__meta__.path)
    const password = randomBytes(8).toString('hex')
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')

    await userRef.update({
        password: `${salt}$${hash}`
    })

    return c.json({ status: true, data: { password, recoveryToken: salt } }, 200);
}