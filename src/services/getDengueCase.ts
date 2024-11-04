import { Context } from "hono"
import { Env } from ".."
import { createRoute, z } from "@hono/zod-openapi"


export const getDengueCaseRoute = createRoute({
	method: 'get',
	path: '/get-case',
	tags: ['dengue'],
	security: [{ cookieAuth: [] }],
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.object({
						status: z.literal(true),
						data: z.array(z.object({
							time: z.string().openapi({ example: '2022-01-01T00:00:00.000Z' }),
							symptoms: z.array(z.string()).openapi({ example: ['fever', 'headache'] }),
							locations: z.array(z.object({
								name: z.string().openapi({ example: 'Singapore' }),
								coordinates: z.object({
									latitude: z.number().openapi({ example: 1.3521 }),
									longitude: z.number().openapi({ example: 103.8198 })
								})
							})),
							remarks: z.string().openapi({ example: 'Remarks' }),
						}))
					})
				}
			},
			description: 'Get dengue case'
		},
		404: {
			content: {
				'application/json': {
					schema: z.object({
						status: z.literal(false),
						message: z.literal('User dengue case not found')
					})
				}
			},
			description: 'User dengue case not found'
		}
	}
})

export async function getDengueCase(c: Context<Env>) {
	const jwtPayload = c.get('jwtPayload')
	const userId = jwtPayload.sub
	const db = c.var.db.client

	const cases = db.ref('cases')
	const query = cases.query({
		select: ['time', 'symptoms', 'locations', 'remarks', 'userId'],
		where: [
			['userId', '==', userId]
		],
		orderBy: { field: 'time', direction: 'desc' },
		limit: 1
	})

	const result = await query.run()
	if (result.length === 0) {
		return c.json({ status: false, message: 'User dengue case not found' as const }, 404)
	}

	delete result[0].userId
	const data = result[0]
	return c.json({ status: true, data }, 200)
}