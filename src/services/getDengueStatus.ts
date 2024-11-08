import { Context } from "hono";
import { Env } from "..";
import { createRoute, z } from "@hono/zod-openapi";


export const getDengueStatusRoute = createRoute({
  method: 'get',
  path: '/get-status',
  tags: ['dengue'],
  request: {
    query: z.object({
      userId: z.string()
    }),
  },
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

export async function getDengueStatus(c: Context<Env, '/get-status', {
  out: {
    query: {
      userId: string;
    };
  };
}>) {
  const { userId } = c.req.valid('query');
  const db = c.var.db.client

  const userRef = db.ref(`users/${userId}`)
  var user
  try {
    user = await userRef.get({
      mask: ['dengueStatus'],
    })
  } catch (e) {
    return c.json(
      {
        status: true,
        data: {
          dengueStatus: "Negative",
        },
      },
      200
    );
  }

  return c.json({ status: true, data: {
    dengueStatus: user.dengueStatus ? 'Positive' : 'Negative'
  }}, 200)
}