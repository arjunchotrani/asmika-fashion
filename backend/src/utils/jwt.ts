import { sign } from 'hono/jwt'

export const generateToken = async (payload: Record<string, unknown>, secret: string): Promise<string> => {
  return await sign({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8) }, secret) // 8 hours
}
