import { Context } from "hono";
import { Env } from "..";
import { scryptSync } from "crypto";
import { createRoute, z } from "@hono/zod-openapi";


export const changePasswordRoute = createRoute({
  method: 'post',
  path: '/change-password',
  tags: ['user'],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            oldPassword: z.string().min(8).openapi({ example: '12345678' }),
            newPassword: z.string().min(8).openapi({ example: 'password' })
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
            status: z.literal(true)
          })
        }
      },
      description: 'Password changed successfully'
    },
    401: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal(false),
            message: z.literal('Old password is incorrect')
          })
        }
      },
      description: 'Old password is incorrect'
    }
  }
})

export async function changePassword(c: Context<Env, "/changePassword", {
  out: {
    json: {
      oldPassword: string;
      newPassword: string;
    };
  };
}>) {
  const jwtPayload = c.get('jwtPayload')
  const userId = jwtPayload.sub
  const db = c.var.db.client

  const { oldPassword, newPassword } = c.req.valid('json')
  const userRef = db.ref(`users/${userId}`)
  const user = await userRef.get({
    mask: ['password']
  })
  const [salt, hash] = user.password.split('$')
  const same = hash === scryptSync(oldPassword, salt, 64).toString('hex')
  if (!same) {
    return c.json({ status: false, message: 'Old password is incorrect' as const }, 401)
  }

  const password = scryptSync(newPassword, salt, 64).toString('hex')
  await userRef.update({
    password: `${salt}$${password}`
  })

  return c.json({ status: true }, 200)
}