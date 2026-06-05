import type { Context, Next } from 'hono'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store — persists for the lifetime of the Worker isolate
const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  /** Max requests allowed in the window */
  max: number
  /** Window duration in milliseconds */
  windowMs: number
  /** Human-readable message shown when limit is hit */
  message?: string
}

export function rateLimit({ max, windowMs, message = 'Too many requests. Please try again later.' }: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
      'unknown'

    const key = `${ip}:${c.req.path}`
    const now = Date.now()

    const entry = store.get(key)

    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    entry.count++

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      c.header('Retry-After', String(retryAfter))
      c.header('X-RateLimit-Limit', String(max))
      c.header('X-RateLimit-Remaining', '0')
      return c.json({ success: false, message }, 429)
    }

    c.header('X-RateLimit-Limit', String(max))
    c.header('X-RateLimit-Remaining', String(max - entry.count))
    return next()
  }
}
