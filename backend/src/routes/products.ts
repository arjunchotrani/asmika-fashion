import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { verify } from 'hono/jwt'
import { productSchema } from '../validators/product.validator'
import { createSupabaseAdminClient } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import type { Env } from '../config/env'

const productRouter = new Hono<{ Bindings: Env }>()

async function isAdminRequest(c: { req: { header: (h: string) => string | undefined } }, secret: string): Promise<boolean> {
  const auth = c.req.header('Authorization')
  if (!auth?.startsWith('Bearer ')) return false
  try {
    await verify(auth.slice(7), secret)
    return true
  } catch {
    return false
  }
}

// Public routes
productRouter.get('/', async (c) => {
  const supabase = createSupabaseAdminClient(c.env)
  const admin = await isAdminRequest(c, c.env.JWT_SECRET)

  const sort = c.req.query('sort') || 'newest'
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    newest:  { column: 'created_at', ascending: false },
    oldest:  { column: 'created_at', ascending: true  },
    alpha:   { column: 'title',      ascending: true  },
    updated: { column: 'updated_at', ascending: false },
  }
  const { column: sortCol, ascending: sortAsc } = sortMap[sort] ?? sortMap.newest

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

  const categoryId  = c.req.query('category_id')
  const collectionId = c.req.query('collection_id')
  const featured    = c.req.query('featured')
  const search      = c.req.query('search')

  if (categoryId)   query = query.eq('category_id', categoryId)
  if (collectionId) query = query.eq('collection_id', collectionId)
  if (featured === 'true') query = query.eq('featured', true)
  if (search) query = query.ilike('title', `%${search.slice(0, 100)}%`)

  if (admin) {
    // Authenticated admins may filter by any status
    const status = c.req.query('status')
    if (status) query = query.eq('status', status)
  } else {
    // Public requests always see only published products
    query = query.eq('status', 'published')
  }

  const { data, error } = await query

  if (error) {
    console.error('Products GET error:', error)
    return c.json({ success: false, message: 'Failed to fetch products' }, 500)
  }
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

  if (error) {
    console.error('Product create error:', error)
    return c.json({ success: false, message: 'Failed to create product' }, 400)
  }

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

  if (error) {
    console.error('Product update error:', error)
    return c.json({ success: false, message: 'Failed to update product' }, 400)
  }

  if (gallery !== undefined && product) {
    await supabase.from('product_images').delete().eq('product_id', product.id)

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

  if (error) {
    console.error('Product archive error:', error)
    return c.json({ success: false, message: 'Failed to archive product' }, 400)
  }
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

  if (error) {
    console.error('Product restore error:', error)
    return c.json({ success: false, message: 'Failed to restore product' }, 400)
  }
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

  if (error) {
    console.error('Product delete error:', error)
    return c.json({ success: false, message: 'Failed to delete product' }, 400)
  }
  return c.json({ success: true, message: 'Product deleted' })
})

export default productRouter
