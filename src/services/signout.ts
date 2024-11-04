import { Context } from "hono"
import { Env } from ".."
import { deleteCookie } from "hono/cookie"
import { createRoute, z } from "@hono/zod-openapi"


export const signOutRoute = createRoute({
  method: 'get',
  path: '/signout',
  tags: ['user'],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal(true)
          })
        }
      },
      description: 'Sign out'
    }
  }
})

export async function signOut(c: Context<Env>) {
  deleteCookie(c, 'token')
  return c.json({ status: true }, 200)
}