import { Context } from "hono";
import { Env } from "..";
import { createRoute, z } from "@hono/zod-openapi";


export const setDengueStatusRoute = createRoute({
  method: 'post',
  path: '/set-status',
  tags: ['dengue'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            userId: z.string(),
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
      userId: string;
      dengueStatus: string;
    };
  };
}>) {
  const db = c.var.db.client

  const { dengueStatus, userId } = c.req.valid('json')
  const status = dengueStatus === 'positive' ? true : false
  const userRef = db.ref(`users/${userId}`)
  await userRef.set({ dengueStatus: status })

  return c.json({ status: true }, 200)
}