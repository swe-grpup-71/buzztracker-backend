import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { DB } from './database'
import { signinRoute, signin } from './services/signin'
import { signupRoute, signup } from './services/signup'
import { resetPasswordRoute, resetPassword } from './services/resetPassword'

export type Env = {
  Bindings: CloudflareBindings
  Variables: {
    db: DB
  }
}

const app = new OpenAPIHono<Env>()
app.use(async (c, next) => {
  const db = new DB(c.env.GOOGLE_CLOUD_PROJECT_ID, c.env.GOOGLE_CLOUD_SERVICE_ACCOUNT)
  c.set('db', db)
  await next()
})

const user = new OpenAPIHono<Env>()
user.openapi(signinRoute, signin)
user.openapi(signupRoute, signup)
user.openapi(resetPasswordRoute, resetPassword)

app.get('/', swaggerUI({ url: '/doc' }))
app.doc('/doc', {
  info: {
    title: 'Buzztracker API',
    version: 'v1'
  },
  openapi: '3.1.0'
})
app.route('/user', user)

export default app