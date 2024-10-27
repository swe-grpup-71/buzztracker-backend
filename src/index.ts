import { createFactory } from 'hono/factory'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import signin from './services/signin'
import { DB } from './database'
import signup from './services/signup'
import resetPassword from './services/resetPassword'

export type Env = {
  Bindings: CloudflareBindings
  Variables: {
    db: DB
  }
}

const appFactory = createFactory<Env>({
  initApp: (app) => {
    app.use(async (c, next) => {
      const db = new DB(c.env.GOOGLE_CLOUD_PROJECT_ID, c.env.GOOGLE_CLOUD_SERVICE_ACCOUNT)
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
      username: z.string().min(1),
      password: z.string().min(8)
    })
  ),
  signin
)
user.post(
  '/signup',
  zValidator(
    'json',
    z.object({
      username: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8)
    })
  ),
  signup
)
user.post(
  '/reset-password',
  zValidator(
    'json',
    z.object({
      email: z.string().email(),
      recoveryToken: z.string().length(32)
    })
  ),
  resetPassword
)

const app = appFactory.createApp()
app.route('/user', user)
export default app