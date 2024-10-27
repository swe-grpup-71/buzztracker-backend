import { Context } from "hono";
import { Env } from "..";
import { randomBytes, scryptSync } from "crypto";
import { Document } from "firebase-firestore-lite";

export default async (c: Context<Env, "/reset-password", {
    out: {
        json: {
            email: string;
            recoveryToken: string;
        };
    };
}>) => {
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
        c.status(404)
        return c.json({ status: false, message: 'Email and Recovery Token does not match' })
    }

    const user = result[0]
    if (user.password.split('$')[0] !== recoveryToken) {
        c.status(404)
        return c.json({ status: false, message: 'Email and Recovery Token does not match' })
    }

    const userRef = db.ref(user.__meta__.path)
    const password = randomBytes(8).toString('hex')
    const salt = randomBytes(16).toString('hex')
    const hash = scryptSync(password, salt, 64).toString('hex')

    await userRef.update({
        password: `${salt}$${hash}`
    })

    return c.json({ status: true, data: { password, recoveryToken: salt } });
}