import { Context } from "hono"
import { Env } from ".."
import { createRoute, z } from "@hono/zod-openapi"


export const getInboxMessagesRoute = createRoute({
  method: 'get',
  path: '/get-messages',
  tags: ['inbox'],
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
            data: z.array(z.object({
              messageId: z.string().length(20).openapi({ example: 'xxxxxxxxxxxxxxxxxxxx' }),
              userId: z.string().length(20).openapi({ example: 'xxxxxxxxxxxxxxxxxxxx' }),
              message: z.string().openapi({ example: 'Sample Message' }),
              createdAt: z.string().openapi({ example: '2022-01-01T00:00:00.000Z' }),
              isRead: z.boolean().openapi({ example: false }),
              isDeleted: z.boolean().openapi({ example: false })
            }))
          })
        }
      },
      description: 'Get inbox messages'
    }
  }
})

export async function getInboxMessages(c: Context<Env, '/get-messages', {
  out: {
    query: {
      userId: string;
    };
  };
}>) {
  const { userId } = c.req.valid("query")
  const db = c.var.db.client

  const messages = db.ref('messages')
  const query = messages.query({
    where: [
      ['userId', '==', userId],
      ['isDeleted', '==', false]
    ],
    orderBy: { field: 'createdAt', direction: 'desc' }
  })
  const result = await query.run()
  const data = result.map((message: any) => {
    return {
      messageId: message.__meta__.id,
      userId: message.userId,
      message: message.message,
      createdAt: message.createdAt,
      isRead: message.isRead,
      isDeleted: message.isDeleted
    }
  })

  return c.json({ status: true, data }, 200)
}
