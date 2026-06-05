import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { enquirySchema, updateEnquiryStatusSchema } from '../validators/enquiry.validator'
import { createSupabaseAdminClient } from '../config/supabase'
import { authMiddleware } from '../middleware/auth'
import { rateLimit } from '../middleware/rateLimit'
import type { Env } from '../config/env'

const enquiryRouter = new Hono<{ Bindings: Env }>()

// Public route to create an enquiry — 5 per IP per 10 minutes
enquiryRouter.post('/', rateLimit({ max: 5, windowMs: 10 * 60 * 1000, message: 'Too many enquiries submitted. Please wait a few minutes before trying again.' }), zValidator('json', enquirySchema), async (c) => {
  const body = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)
  
  const { data, error } = await supabase
    .from('enquiries')
    .insert([body])
    .select()
    .single()

  if (error) throw error
  return c.json({ success: true, message: 'Enquiry created successfully', data }, 201)
})

// Protected routes
enquiryRouter.use('*', authMiddleware)

enquiryRouter.get('/', async (c) => {
  const supabase = createSupabaseAdminClient(c.env)
  
  let query = supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })

  const status = c.req.query('status')
  const archived = c.req.query('archived')

  if (status) query = query.eq('status', status)
  if (archived === 'true') query = query.eq('archived', true)
  if (archived === 'false' || !archived) query = query.eq('archived', false) // default hide archived

  const { data, error } = await query

  if (error) throw error
  return c.json({ success: true, data })
})

enquiryRouter.put('/:id/status', zValidator('json', updateEnquiryStatusSchema), async (c) => {
  const id = c.req.param('id')
  const { status } = c.req.valid('json')
  const supabase = createSupabaseAdminClient(c.env)
  
  const { data, error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return c.json({ success: true, message: 'Enquiry status updated', data })
})

enquiryRouter.post('/:id/archive', async (c) => {
  const id = c.req.param('id')
  const supabase = createSupabaseAdminClient(c.env)
  
  const { data, error } = await supabase
    .from('enquiries')
    .update({ archived: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return c.json({ success: true, message: 'Enquiry archived', data })
})

export default enquiryRouter
