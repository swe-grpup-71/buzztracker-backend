import { Context } from "hono"
import { Env } from ".."
import { createRoute, z } from "@hono/zod-openapi"


export const getProfileRoute = createRoute({
  method: 'get',
  path: '/profile',
  tags: ['user'],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal(true),
            data: z.object({
              userId: z.string().length(20).openapi({ example: 'xxxxxxxxxxxxxxxxxxxx' }),
              username: z.string().openapi({ example: 'username' }),
              email: z.string().email(),
              dengueStatus: z.boolean(),
            })
          })
        }
      },
      description: 'Get user profile'
    }
  }
})

export async function getProfile(c: Context<Env>) {
  const jwtPayload = c.get('jwtPayload')
  const userId = jwtPayload.sub
  const db = c.var.db.client

  const userRef = db.ref(`users/${userId}`)
  const user = await userRef.get()
  user.userId = userId
  delete user.password
  return c.json({ status: true, data: user as any }, 200)
}