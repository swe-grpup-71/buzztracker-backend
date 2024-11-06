import { Context } from "hono";
import { Env } from "..";
import { createRoute, z } from "@hono/zod-openapi";


export const setIsReadInboxMessageRoute = createRoute({
  method: 'post',
  path: '/set-isread-message',
  tags: ['inbox'],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            messageId: z.string().length(20).openapi({ example: 'xxxxxxxxxxxxxxxxxxxx' }),
            isRead: z.boolean()
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
      description: 'Set isRead inbox message'
    },
    404: {
      content: {
        'application/json': {
          schema: z.object({
            status: z.literal(false),
            message: z.literal('Message not found')
          })
        }
      },
      description: 'Message not found'
    }
  }
})

export async function setIsReadInboxMessage(c: Context<Env, "/set-isread-message", {
  out: {
    json: {
      messageId: string;
      isRead: boolean;
    };
  };
}>) {
  const jwtPayload = c.get('jwtPayload')
  const userId = jwtPayload.sub
  const db = c.var.db.client

  const { messageId, isRead } = c.req.valid('json')
  const messageRef = db.ref(`messages/${messageId}`)

  var message
  try {
    message = await messageRef.get()
  } catch (error) {
    return c.json({ status: false, message: 'Message not found' as const }, 404)
  }

  if (message.userId !== userId) {
    return c.json({ status: false, message: 'Message not found' as const }, 404)
  }

  await messageRef.update({ isRead })
  return c.json({ status: true }, 200)
}