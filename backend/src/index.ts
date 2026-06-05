import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { errorHandler } from './middleware/error'
import { rateLimit } from './middleware/rateLimit'
import authRouter from './routes/auth'
import categoryRouter from './routes/categories'
import subcategoryRouter from './routes/subcategories'
import collectionRouter from './routes/collections'
import productRouter from './routes/products'
import enquiryRouter from './routes/enquiries'
import formatterRouter from './routes/formatter'
import uploadRouter from './routes/uploads'
import type { Env } from './config/env'

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(www\.)?asmikafashion\.com$/,
  /^https:\/\/admin\.asmikafashion\.com$/,
  /^https:\/\/asmika[-\w]*\.vercel\.app$/,
  /^https:\/\/asmika[-\w]*\.pages\.dev$/,
  /^http:\/\/(localhost|127\.0\.0\.1):(3000|3001)$/,
]

const app = new Hono<{ Bindings: Env }>()

app.use('*', logger())
app.use('*', cors({
  origin: (origin) => ALLOWED_ORIGIN_PATTERNS.some(p => p.test(origin)) ? origin : null,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  maxAge: 86400,
}))

app.onError(errorHandler)

app.get('/', (c) => {
  return c.json({ success: true, message: 'Asmika Fashion API is running' })
})

app.get('/api/health', (c) => {
  return c.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
})

app.route('/api/auth', authRouter)
app.route('/api/categories', categoryRouter)
app.route('/api/subcategories', subcategoryRouter)
app.route('/api/collections', collectionRouter)
app.use('/api/products', rateLimit({ max: 60, windowMs: 60 * 1000 }))
app.route('/api/products', productRouter)
app.route('/api/enquiries', enquiryRouter)
app.route('/api/formatter', formatterRouter)
app.route('/api/uploads', uploadRouter)

export default app
