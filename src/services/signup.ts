import { Context } from "hono";
import { Env } from "..";
import { Document, Reference } from "firebase-firestore-lite";
import { randomBytes, scryptSync } from "crypto";
import { createRoute, z } from "@hono/zod-openapi";

export const signupRoute = createRoute({
    method: 'post',
    path: '/signup',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        username: z.string().min(1).openapi({ example: 'username' }),
                        email: z.string().email(),
                        password: z.string().min(8).openapi({ example: 'password' })
                    })
                }
            }
        }
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal(true),
                        data: z.object({
                            recoveryToken: z.string().length(32).openapi({ example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
                        })
                    })
                }
            },
            description: 'Successfully signed up'
        },
        409: {
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal(false),
                        message: z.string().openapi({ example: 'Email already exists' })
                    })
                }
            },
            description: 'Conflict'
        }
    }
})

export async function signup(c: Context<Env, "/signup", {
    out: {
        json: {
            username: string;
            email: string;
            password: string;
        };
    };
}>) {
    const db = c.var.db.client

    const { username, email, password } = c.req.valid('json')
    const users = db.ref('users')
    const query = users.query({
        select: ['username', 'email'],
        where: [
            ['email', '==', email],
        ],
        limit: 1
    })
    const result: Array<Document> = await query.run()

    if (result.length > 0) {
        return c.json({ status: false, message: 'Email already exists' }, 409)
    }

    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')
    const user = await users.add({
        username,
        email,
        password: `${salt}$${hash}`
    }) as Reference

    return c.json({ status: true, data: { recoveryToken: salt } }, 200);
}