import { Context } from "hono";
import { Env } from "..";
import { createRoute, z } from "@hono/zod-openapi";

export const createInboxMessagesRoute = createRoute({
  method: "post",
  path: "/create-messages",
  tags: ["inbox"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            userId: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.literal(true),
          }),
        },
      },
      description: "Create inbox messages",
    },
  },
});

export async function createInboxMessages(c: Context<Env, "/create-messages",
  {
    out: {
      json: {
        userId: string;
      };
    };
  }
>) {
  const db = c.var.db.client;
  const { userId } = c.req.valid("json");

  const tx = db.transaction();
  tx.add("messages", {
    userId,
    message:
      "💡 Tip of the Day: Clear stagnant water around your home to reduce mosquito breeding. Empty plant trays, buckets, and pet bowls every day.",
    createdAt: new Date(),
    isRead: false,
    isDeleted: false,
  });
  tx.add("messages", {
    userId,
    message:
      "⚠️ Dengue Symptoms Reminder: Early signs include high fever, nausea, and joint pain. See a doctor if you’re experiencing these symptoms.",
    createdAt: new Date(),
    isRead: false,
    isDeleted: false,
  });
  tx.add("messages", {
    userId,
    message:
      "🧠 Did you know? Dengue mosquitoes mostly bite during the day. Stay protected by using insect repellents and wearing long sleeves.",
    createdAt: new Date(),
    isRead: false,
    isDeleted: false,
  });
  await tx.commit();

  return c.json({ status: true }, 200);
}
