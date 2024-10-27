import { scryptSync } from "crypto"
import { Context } from 'hono'
import type { Env } from '..'
import { sign } from 'hono/jwt'
import { setCookie } from 'hono/cookie'
import { Document } from 'firebase-firestore-lite'

export default async (c: Context<Env, "/signin", {
  out: {
    json: {
      username: string;
      password: string;
    };
  };
}>) => {
  const db = c.var.db.client

  const { username, password } = c.req.valid('json')
  const users = db.ref('users')
  const query = users.query({
    select: ['username', 'password'],
    where: [
      ['username', '==', username]
    ],
    limit: 1
  })
  const result: Array<Document> = await query.run()

  if (result.length === 0) {
    c.status(404)
    return c.json({ status: false, message: 'Username and Password does not match' })
  }

  const user = result[0]
  const [salt, hash] = user.password.split('$')
  const same = hash === scryptSync(password, salt, 64).toString('hex')
  if (!same) {
    c.status(401)
    return c.json({ status: false, message: 'Username and Password does not match' })
  }

  const now = Date.now()
  const payload = {
    sub: user.id,
    nbf: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 60 * 60 // 1 hour
  }
  const token = await sign(payload, c.env.JWT_SECRET)
  setCookie(c, 'token', token, { httpOnly: true, secure: true, sameSite: 'none' })
  return c.json({ status: true, data: { username, email: user.email } });
}