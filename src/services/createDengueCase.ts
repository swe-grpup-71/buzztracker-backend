import { Context } from "hono";
import { Env } from "..";
import { createRoute, z } from "@hono/zod-openapi";


export const createDengueCaseRoute = createRoute({
  method: 'post',
  path: '/create-case',
  tags: ['dengue'],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            symptoms: z.array(z.string().trim().min(1)).min(1),
            locations: z.array(z.object({
              name: z.string().trim().min(1),
              coordinates: z.object({
                latitude: z.number(),
                longitude: z.number()
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
            status: z.literal(true)
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
  const jwtPayload = c.get('jwtPayload')
  const userId = jwtPayload.sub
  const db = c.var.db.client

  const { symptoms, locations, remarks } = c.req.valid('json')
  const cases = db.ref('cases')

  const data = { time: new Date(), symptoms, locations, remarks, userId }
  await cases.add(data)
  return c.json({ status: true }, 200)
}