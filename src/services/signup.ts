import { Context } from "hono";
import { Env } from "..";
import { Document, Reference } from "firebase-firestore-lite";
import { randomBytes, scryptSync } from "crypto";
import { createRoute, z } from "@hono/zod-openapi";

export const signupRoute = createRoute({
    method: 'post',
    path: '/signup',
    tags: ['auth'],
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
                        message: z.literal('Email already exists')
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
        return c.json({ status: false, message: 'Email already exists' as const }, 409)
    }

    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')
    const user = await users.add({
        username,
        email,
        password: `${salt}$${hash}`,
        dengueStatus: false,
    }) as Reference

    const tx = db.transaction()
    tx.add(
        "messages",
        {
            userId: user.id,
            message: '💡 Tip of the Day: Clear stagnant water around your home to reduce mosquito breeding. Empty plant trays, buckets, and pet bowls every day.',
            createdAt: new Date(),
            isRead: false,
            isDeleted: false
        }
    )
    tx.add(
        "messages",
        {
            userId: user.id,
            message: '⚠️ Dengue Symptoms Reminder: Early signs include high fever, nausea, and joint pain. See a doctor if you’re experiencing these symptoms.',
            createdAt: new Date(),
            isRead: false,
            isDeleted: false
        }
    )
    tx.add(
        "messages",
        {
            userId: user.id,
            message: '🧠 Did you know? Dengue mosquitoes mostly bite during the day. Stay protected by using insect repellents and wearing long sleeves.',
            createdAt: new Date(),
            isRead: false,
            isDeleted: false
        }
    )
    await tx.commit()

    return c.json({ status: true, data: { recoveryToken: salt } }, 200);
}