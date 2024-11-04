import { swaggerUI } from '@hono/swagger-ui'
import { Hook, OpenAPIHono } from '@hono/zod-openapi'
import { DB, setDB } from './database'
import { signinRoute, signin } from './services/signin'
import { signupRoute, signup } from './services/signup'
import { resetPasswordRoute, resetPassword } from './services/resetPassword'
import { fromZodError } from 'zod-validation-error'
import { JwtVariables } from 'hono/jwt'
import { jwtMiddleware } from './auth'
import { getDengueStatusRoute, getDengueStatus } from './services/getDengueStatus'
import { setDengueStatus, setDengueStatusRoute } from './services/setDengueStatus'
import { getDengueCaseRoute, getDengueCase } from './services/getDengueCase'
import { createDengueCaseRoute, createDengueCase } from './services/createDengueCase'
import { changePasswordRoute, changePassword } from './services/changePassword'
import { signOut, signOutRoute } from './services/signout'


export type Env = {
  Bindings: CloudflareBindings
  Variables: {
    db: DB
  } & JwtVariables
}

const defaultHook: Hook<any, Env, any, any> = (result, c) => {
  if (!result.success) {
    return c.json({ status: false, message: fromZodError(result.error).toString() }, 422)
  }
}

const app = new OpenAPIHono<Env>()
app.use(setDB)
app.openAPIRegistry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'token'
})

const auth = new OpenAPIHono<Env>({ defaultHook })
auth.openapi(signinRoute, signin)
auth.openapi(signupRoute, signup)
auth.openapi(resetPasswordRoute, resetPassword)

const dengue = new OpenAPIHono<Env>({ defaultHook })
dengue.use(jwtMiddleware)
dengue.openapi(getDengueStatusRoute, getDengueStatus)
dengue.openapi(setDengueStatusRoute, setDengueStatus)
dengue.openapi(getDengueCaseRoute, getDengueCase)
dengue.openapi(createDengueCaseRoute, createDengueCase)

const user = new OpenAPIHono<Env>({ defaultHook })
user.use(jwtMiddleware)
user.openapi(changePasswordRoute, changePassword)
user.openapi(signOutRoute, signOut)

app.get('/', swaggerUI({ url: '/doc' }))
app.doc('/doc', {
  info: {
    title: 'Buzztracker API',
    version: 'v1'
  },
  openapi: '3.1.0'
})
app.route('/auth', auth)
app.route('/dengue', dengue)
app.route('/user', user)

export default app