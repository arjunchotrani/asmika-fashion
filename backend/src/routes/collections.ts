import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { verify } from 'hono/jwt'
import { collectionSchema } from '../validators/collection.validator'
import { createSupabaseAdminClient } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../config/env'

const collectionRouter = new Hono<{ Bindings: Env }>()

async function isAdminRequest(authHeader: string | undefined, secret: string): Promise<boolean> {
  if (!authHeader?.startsWith('Bearer ')) return false
  try {
    await verify(authHeader.slice(7), secret, 'HS256')
    return true
  } catch {
    return false
  }
}

// Public routes
collectionRouter.get('/', async (c) => {
  const supabase = createSupabaseAdminClient(c.env)
  const admin = await isAdminRequest(c.req.header('Authorization'), c.env.JWT_SECRET)

  let query = supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })

  // Public requests see only published; admins see all
  if (!admin) {
    query = query.eq('status', 'published')
  }

  const { data, error } = await query

  if (error) {
    console.error('Collections GET error:', error)
    return c.json({ success: false, message: 'Failed to fetch collections' }, 500)
  }
  return c.json({ success: true, data })
})

collectionRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)

  const query = supabase.from('collections').select('*')
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  if (isUuid) {
    const { data, error } = await query.eq('id', id).single()
    if (!error) return c.json({ success: true, data })
  }

  const { data, error } = await query.eq('slug', id).single()
  if (error) return c.json({ success: false, message: 'Collection not found' }, 404)

  return c.json({ success: true, data })
})

// Protected routes
collectionRouter.use('*', authMiddleware)

collectionRouter.post('/', zValidator('json', collectionSchema), async (c) => {
  const body = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)

  const { data, error } = await supabase
    .from('collections')
    .insert([body])
    .select()
    .single()

  if (error) {
    console.error('Collection create error:', error)
    return c.json({ success: false, message: 'Failed to create collection' }, 400)
  }
  return c.json({ success: true, message: 'Collection created', data }, 201)
})

collectionRouter.put('/:id', zValidator('json', collectionSchema.partial()), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('collections').update(body)

  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { data, error } = await query.select().single()

  if (error) {
    console.error('Collection update error:', error)
    return c.json({ success: false, message: 'Failed to update collection' }, 400)
  }
  return c.json({ success: true, message: 'Collection updated', data })
})

collectionRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('collections').delete()

  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { error } = await query

  if (error) {
    console.error('Collection delete error:', error)
    return c.json({ success: false, message: 'Failed to delete collection' }, 400)
  }
  return c.json({ success: true, message: 'Collection deleted' })
})

export default collectionRouter
