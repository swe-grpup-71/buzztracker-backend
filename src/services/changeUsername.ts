import { Context } from "hono";
import { Env } from "..";
import { createRoute, z } from "@hono/zod-openapi";


export const changeUsernameRoute = createRoute({
  method: 'post',
  path: '/change-username',
  tags: ['user'],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            newUsername: z.string().openapi({ example: 'New Username' })
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
      description: 'Username changed successfully'
    }
  }
})

export async function changeUsername(c: Context<Env, "/changeUsername", {
  out: {
    json: {
      newUsername: string;
    };
  };
}>) {
  const jwtPayload = c.get('jwtPayload')
  const userId = jwtPayload.sub
  const db = c.var.db.client

  const { newUsername } = c.req.valid('json')
  const userRef = db.ref(`users/${userId}`)
  await userRef.update({
    username: newUsername
  })

  return c.json({ status: true }, 200)
}