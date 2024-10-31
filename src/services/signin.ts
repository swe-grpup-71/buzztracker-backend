import { scryptSync } from "crypto"
import { Context } from 'hono'
import type { Env } from '..'
import { sign } from 'hono/jwt'
import { setCookie } from 'hono/cookie'
import { Document } from 'firebase-firestore-lite'
import { createRoute, z } from "@hono/zod-openapi"

export const signinRoute = createRoute({
  method: 'post',
  path: '/signin',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
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
              username: z.string().openapi({ example: 'username' }),
              email: z.string().email()
            })
          })
        }
      },
      description: 'Successfully signed in'
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal(false),
            message: z.string().openapi({ example: 'Email and Password does not match' })
          })
        }
      },
      description: 'Unauthorized'
    },
  }
})

export async function signin(c: Context<Env, "/signin", {
  out: {
    json: {
      email: string;
      password: string;
    };
  };
}>) {
  const db = c.var.db.client

  const { email, password } = c.req.valid('json')
  const users = db.ref('users')
  const query = users.query({
    select: ['username', 'email', 'password'],
    where: [
      ['email', '==', email]
    ],
    limit: 1
  })
  const result: Array<Document> = await query.run()

  if (result.length === 0) {
    return c.json({ status: false, message: 'Email and Password does not match' }, 401)
  }

  const user = result[0]
  const [salt, hash] = user.password.split('$')
  const same = hash === scryptSync(password, salt, 64).toString('hex')
  if (!same) {
    return c.json({ status: false, message: 'Email and Password does not match' }, 401)
  }

  const now = Date.now()
  const payload = {
    sub: user.id,
    nbf: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + 60 * 60 // 1 hour
  }
  const token = await sign(payload, c.env.JWT_SECRET)
  setCookie(c, 'token', token, { httpOnly: true, secure: true, sameSite: 'none' })
  return c.json({ status: true, data: { username: user.username, email } }, 200);
}