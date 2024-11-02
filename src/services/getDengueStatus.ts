import { Context } from "hono";
import { Env } from "..";
import { createRoute, z } from "@hono/zod-openapi";


export const getDengueStatusRoute = createRoute({
  method: 'get',
  path: '/get-status',
  tags: ['dengue'],
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal(true),
            data: z.object({
              dengueStatus: z.string().openapi({ example: 'Positive' })
            })
          })
        }
      },
      description: 'Get dengue status'
    }
  }
})

export async function getDengueStatus(c: Context<Env>) {
  const jwtPayload = c.get('jwtPayload')
  const userId = jwtPayload.sub
  const db = c.var.db.client

  const userRef = db.ref(`users/${userId}`)
  const user = await userRef.get({
    mask: ['dengueStatus'],
  })

  return c.json({ status: true, data: {
    dengueStatus: user.dengueStatus ? 'Positive' : 'Negative'
  }}, 200)
}