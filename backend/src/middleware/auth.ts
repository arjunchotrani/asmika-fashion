import { jwt } from 'hono/jwt'
import type { Context, Next } from 'hono'
import type { Env } from '../config/env'

export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    alg: 'HS256',
  })
  return jwtMiddleware(c, next)
}
