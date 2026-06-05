import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { productSchema } from '../validators/product.validator'
import { createSupabaseAdminClient } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../config/env'

const productRouter = new Hono<{ Bindings: Env }>()

// Public routes
productRouter.get('/', async (c) => {
  const supabase = createSupabaseAdminClient(c.env)
  
  // Sort
  const sort = c.req.query('sort') || 'newest'
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest:  { column: 'created_at', ascending: false },
    oldest:  { column: 'created_at', ascending: true  },
    alpha:   { column: 'title',      ascending: true  },
    updated: { column: 'updated_at', ascending: false },
  }
  const { column: sortCol, ascending: sortAsc } = sortMap[sort] ?? sortMap.newest

  // Build query
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      subcategory:subcategories(name, slug),
      collection:collections(name, slug),
      images:product_images(url, display_order)
    `)
    .order(sortCol, { ascending: sortAsc })

  // Filters
  const categoryId = c.req.query('category_id')
  const collectionId = c.req.query('collection_id')
  const status = c.req.query('status')
  const featured = c.req.query('featured')
  const search = c.req.query('search')

  if (categoryId) query = query.eq('category_id', categoryId)
  if (collectionId) query = query.eq('collection_id', collectionId)
  if (status) query = query.eq('status', status)
  if (featured === 'true') query = query.eq('featured', true)
  if (search) query = query.ilike('title', `%${search.slice(0, 100)}%`)

  const { data, error } = await query

  if (error) return c.json({ success: false, message: error.message }, 500)
  return c.json({ success: true, data })
})

productRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)
  
  const query = supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug),
      subcategory:subcategories(name, slug),
      collection:collections(name, slug),
      images:product_images(url, display_order)
    `)

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  
  if (isUuid) {
    const { data, error } = await query.eq('id', id).single()
    if (!error) return c.json({ success: true, data })
  }

  const { data, error } = await query.eq('slug', id).single()
  if (error) return c.json({ success: false, message: 'Product not found' }, 404)
  
  return c.json({ success: true, data })
})

// Protected routes
productRouter.use('*', authMiddleware)

productRouter.post('/', zValidator('json', productSchema), async (c) => {
  const { gallery, ...productData } = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)
  
  const { data: product, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single()

  if (error) return c.json({ success: false, message: error.message }, 400)

  // Insert gallery images if provided
  if (gallery && gallery.length > 0 && product) {
    const imagesToInsert = gallery.map((url, index) => ({
      product_id: product.id,
      url,
      display_order: index,
    }))
    
    const { error: imagesError } = await supabase
      .from('product_images')
      .insert(imagesToInsert)

    if (imagesError) console.error('Error inserting product images:', imagesError)
  }

  return c.json({ success: true, message: 'Product created', data: product }, 201)
})

productRouter.put('/:id', zValidator('json', productSchema.partial()), async (c) => {
  const id = c.req.param('id')
  const { gallery, ...productData } = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('products').update(productData)
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { data: product, error } = await query.select().single()

  if (error) return c.json({ success: false, message: error.message }, 400)

  // Update gallery if provided
  if (gallery !== undefined && product) {
    // Delete existing images
    await supabase.from('product_images').delete().eq('product_id', product.id)
    
    // Insert new images
    if (gallery.length > 0) {
      const imagesToInsert = gallery.map((url, index) => ({
        product_id: product.id,
        url,
        display_order: index,
      }))
      await supabase.from('product_images').insert(imagesToInsert)
    }
  }

  return c.json({ success: true, message: 'Product updated', data: product })
})

productRouter.post('/:id/archive', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('products').update({ status: 'archived' })
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { data, error } = await query.select().single()

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Product archived', data })
})

productRouter.post('/:id/restore', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('products').update({ status: 'draft' })
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { data, error } = await query.select().single()

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Product restored to draft', data })
})

productRouter.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  let query = supabase.from('products').delete()
  
  if (isUuid) {
    query = query.eq('id', id)
  } else {
    query = query.eq('slug', id)
  }

  const { error } = await query

  if (error) return c.json({ success: false, message: error.message }, 400)
  return c.json({ success: true, message: 'Product deleted' })
})

export default productRouter
