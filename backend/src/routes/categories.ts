import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { categorySchema, subcategorySchema } from '../validators/category.validator'
import { createSupabaseAdminClient } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../config/env'

const categoryRouter = new Hono<{ Bindings: Env }>()

// Public routes
categoryRouter.get('/', async (c) => {
  const supabase = createSupabaseAdminClient(c.env)
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('created_at', { ascending: false })

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, data })
})

// Fetch by ID (UUID)
categoryRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)
  
  // Try matching ID first, then slug
  const query = supabase.from('categories').select('*, subcategories(*)')
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  
  if (isUuid) {
    const { data, error } = await query.eq('id', id).single()
    if (!error) return c.json({ success: true, data })
  }

  const { data, error } = await query.eq('slug', id).single()
  if (error) return c.json({ success: false, message: 'Category not found' }, 404)
  
  return c.json({ success: true, data })
})

// Protected routes
categoryRouter.use('*', authMiddleware)

categoryRouter.post('/', zValidator('json', categorySchema), async (c) => {
  const body = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)
  
  const { data, error } = await supabase
    .from('categories')
    .insert([body])
    .select()
    .single()

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Category created', data }, 201)
})

categoryRouter.put('/:id', zValidator('json', categorySchema.partial()), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('categories').update(body)
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { data, error } = await query.select().single()

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Category updated', data })
})

categoryRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('categories').delete()
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { error } = await query

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Category deleted' })
})

export default categoryRouter
