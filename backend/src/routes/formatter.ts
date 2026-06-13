import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { formatTextileData } from '../utils/formatter'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../config/env'

const formatterRouter = new Hono<{ Bindings: Env }>()

const formatterSchema = z.object({
  raw_text: z.string().min(1, 'Raw text input is required'),
})

// Protected route
formatterRouter.use('*', authMiddleware)

formatterRouter.post('/', zValidator('json', formatterSchema), async (c) => {
  const { raw_text } = c.req.valid('json')

  try {
    const formattedData = formatTextileData(raw_text)
    return c.json({
      success: true,
      message: 'Data formatted successfully',
      data: formattedData,
    })
  } catch (error) {
    console.error('Formatter error:', error)
    return c.json({ success: false, message: 'Failed to format data' }, 400)
  }
})

export default formatterRouter
