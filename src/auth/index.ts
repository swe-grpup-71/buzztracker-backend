import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { Env } from "..";


export const jwtMiddleware = createMiddleware<Env>(async (c, next) => {
  return jwt({
    secret: c.env.JWT_SECRET,
  })(c, next)
})