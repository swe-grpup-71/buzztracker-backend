import { swaggerUI } from '@hono/swagger-ui'
import { Hook, OpenAPIHono } from '@hono/zod-openapi'
import { fromZodError } from 'zod-validation-error'

import { DB, setDB } from './database'

import { getDengueStatusRoute, getDengueStatus } from './services/getDengueStatus'
import { setDengueStatus, setDengueStatusRoute } from './services/setDengueStatus'
import { getDengueCaseRoute, getDengueCase } from './services/getDengueCase'
import { createDengueCaseRoute, createDengueCase } from './services/createDengueCase'

import { getInboxMessagesRoute, getInboxMessages } from './services/getInboxMessages'
import { setIsReadInboxMessage, setIsReadInboxMessageRoute } from './services/setIsReadInboxMessage'


export type Env = {
  Bindings: CloudflareBindings
  Variables: {
    db: DB
  }
}

const defaultHook: Hook<any, Env, any, any> = (result, c) => {
  if (!result.success) {
    return c.json({ status: false, message: fromZodError(result.error).toString() }, 422)
  }
}

const app = new OpenAPIHono<Env>()
app.use(setDB)

const auth = new OpenAPIHono<Env>({ defaultHook })

const dengue = new OpenAPIHono<Env>({ defaultHook })
dengue.openapi(getDengueStatusRoute, getDengueStatus)
dengue.openapi(setDengueStatusRoute, setDengueStatus)
dengue.openapi(getDengueCaseRoute, getDengueCase)
dengue.openapi(createDengueCaseRoute, createDengueCase)

const inbox = new OpenAPIHono<Env>({ defaultHook })
inbox.openapi(getInboxMessagesRoute, getInboxMessages)
inbox.openapi(setIsReadInboxMessageRoute, setIsReadInboxMessage)
// inbox.openapi(readAllInboxMessagesRoute, readAllInboxMessages)
// inbox.openapi(deleteInboxMessageRoute, deleteInboxMessage)
// inbox.openapi(deleteAllInboxMessagesRoute, deleteAllInboxMessages)

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
app.route('/inbox', inbox)

export default app