import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { subcategorySchema } from '../validators/category.validator'
import { createSupabaseAdminClient } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../config/env'

const subcategoryRouter = new Hono<{ Bindings: Env }>()

// Public routes
subcategoryRouter.get('/', async (c) => {
  const supabase = createSupabaseAdminClient(c.env)
  const { data, error } = await supabase
    .from('subcategories')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false })

  if (error) return c.json({ success: false, message: error.message }, 500)
  
  // Flatten category name for convenience
  const formattedData = data?.map(item => ({
    ...item,
    category_name: item.category?.name
  }))

  return c.json({ success: true, data: formattedData })
})

subcategoryRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)
  
  const query = supabase.from('subcategories').select('*, category:categories(name)')
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  
  if (isUuid) {
    const { data, error } = await query.eq('id', id).single()
    if (!error) return c.json({ success: true, data })
  }

  const { data, error } = await query.eq('slug', id).single()
  if (error) return c.json({ success: false, message: 'Subcategory not found' }, 404)
  
  return c.json({ success: true, data })
})

// Protected routes
subcategoryRouter.use('*', authMiddleware)

subcategoryRouter.post('/', zValidator('json', subcategorySchema), async (c) => {
  const body = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)
  
  const { data, error } = await supabase
    .from('subcategories')
    .insert([body])
    .select()
    .single()

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Subcategory created', data }, 201)
})

subcategoryRouter.put('/:id', zValidator('json', subcategorySchema.partial()), async (c) => {
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('subcategories').update(body)
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { data, error } = await query.select().single()

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Subcategory updated', data })
})

subcategoryRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('subcategories').delete()
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { error } = await query

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Subcategory deleted' })
})

export default subcategoryRouter
