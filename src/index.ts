import { createFactory } from 'hono/factory'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import signin from './services/signin'
import { DB } from './database'

export type Env = {
  Bindings: CloudflareBindings
  Variables: {
      db: DB
  }
}

const appFactory = createFactory<Env>({
  initApp: (app) => {
    app.use(async (c, next) => {
      const db = new DB(c.env.APPWRITE_API_SECRET, c.env.APPWRITE_PROJECT_ID, c.env.APPWRITE_DATABASE_ID)
      c.set('db', db)
      await next()
    })
  },
})

const user = appFactory.createApp()
user.post(
  '/signin',
  zValidator(
    'json',
    z.object({
      email: z.string().email(),
      password: z.string().min(8)
    })
  ),
  signin
)

const app = appFactory.createApp()
app.route('/user', user)
export default app