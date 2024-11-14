import { Context } from "hono";
import { Env } from "..";
import { createRoute, z } from "@hono/zod-openapi";
import { Reference } from "firebase-firestore-lite";


export const createDengueCaseRoute = createRoute({
  method: 'post',
  path: '/create-case',
  tags: ['dengue'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            userId: z.string(),
            symptoms: z.array(z.string().trim().min(1)).min(1),
            locations: z.array(z.object({
              name: z.string().trim().min(1),
              coordinates: z.object({
                latitude: z.number().min(-90).max(90),
                longitude: z.number().min(-180).max(180)
              })
            })).min(1),
            remarks: z.string()
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
            status: z.literal(true),
            data: z.object({
              caseId: z.string().length(20).openapi({ example: 'xxxxxxxxxxxxxxxxxxxx' })
            })
          })
        }
      },
      description: 'Successfully created dengue case'
    }
  }
})

export async function createDengueCase(c: Context<Env, "/createDengueCase", {
  out: {
    json: {
      userId: string;
      symptoms: string[];
      locations: {
        name: string;
        coordinates: {
          latitude: number;
          longitude: number;
        };
      }[];
      remarks: string;
    };
  };
}>) {
  const db = c.var.db.client

  const { userId, symptoms, locations, remarks } = c.req.valid('json')
  const cases = db.ref('cases')

  const data = { userId, time: new Date(), symptoms, locations, remarks }
  const caseRef = await cases.add(data) as Reference
  return c.json({ status: true, data: { caseId: caseRef.id } }, 200)
}