import { Context } from "hono";
import { Env } from "..";
import { Document, Reference } from "firebase-firestore-lite";
import { randomBytes, scryptSync } from "crypto";

export default async (c: Context<Env, "/signup", {
    out: {
        json: {
            username: string;
            email: string;
            password: string;
        };
    };
}>) => {
    const db = c.var.db.client

    const { username, email, password } = c.req.valid('json')
    const users = db.ref('users')
    const query = users.query({
        select: ['username', 'email'],
        where: [
            ['username', '==', username],
        ],
        limit: 1
    })
    const result: Array<Document> = await query.run()

    if (result.length > 0) {
        c.status(409)
        return c.json({ status: false, message: 'Username already exists' })
    }

    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')
    const user = await users.add({
        username,
        email,
        password: `${salt}$${hash}`
    }) as Reference

    return c.json({ status: true, data: { recoveryToken: salt } });
}