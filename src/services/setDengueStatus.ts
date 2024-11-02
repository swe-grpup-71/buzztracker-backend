import { Context } from "hono";
import { Env } from "..";
import { createRoute, z } from "@hono/zod-openapi";


export const setDengueStatusRoute = createRoute({
  method: 'post',
  path: '/set-status',
  tags: ['dengue'],
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            dengueStatus: z.literal('positive').or(z.literal('negative'))
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
      description: 'Set dengue status'
    }
  }
})

export async function setDengueStatus(c: Context<Env, "/set-status", {
  out: {
    json: {
      dengueStatus: string;
    };
  };
}>) {
  const jwtPayload = c.get('jwtPayload')
  const userId = jwtPayload.sub
  const db = c.var.db.client

  const { dengueStatus } = c.req.valid('json')
  const status = dengueStatus === 'positive' ? true : false
  const userRef = db.ref(`users/${userId}`)
  await userRef.update({ dengueStatus: status })

  return c.json({ status: true }, 200)
}