import { Query } from 'node-appwrite'
import bcrypt from 'bcrypt'
import { Context } from 'hono';
import type { Env } from '../index'
import { sign } from 'hono/jwt'
import { setCookie } from 'hono/cookie';

export default async (c: Context<Env, "/signin", {
    in: {
        json: {
            email: string;
            password: string;
        };
    };
    out: {
        json: {
            email: string;
            password: string;
        };
    };
}>) => {
    const db = c.var.db

    const { email, password } = c.req.valid('json')
    const collection_id = await db.collection('users')
    const result = await db.findDocuments(
      collection_id,
      [
        Query.select(['email', 'password']),
        Query.equal('email', email),
      ],
      0, 1
    )

    if (result.total === 0) {
      c.status(404)
      return c.json({ status: false, message: 'User not found' })
    }

    if (result.total > 1) {
      c.status(500)
      return c.json({ status: false, message: 'Internal server error' })
    }

    const user = result.documents[0]
    const same = await bcrypt.compare(password, user.password)
    if (!same) {
      c.status(401)
      return c.json({ status: false, message: 'Email/Password does not match' })
    }

    const payload = {
      sub: user.$id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 // 1 hour
    }
    const token = await sign(payload, c.env.JWT_SECRET)
    setCookie(c, 'token', token, { httpOnly: true, secure: true, sameSite: 'none' })
    return c.json({ status: true });
}