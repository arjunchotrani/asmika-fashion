import { z } from 'zod'

export const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phone: z.string().min(7, 'Phone number too short').max(20, 'Phone number too long').regex(/^[+\d\s\-()]+$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').max(254).optional().or(z.literal('')),
  product_slug: z.string().max(200).optional(),
  message: z.string().max(2000, 'Message too long').optional(),
})

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'converted', 'closed']),
})

export type EnquiryInput = z.infer<typeof enquirySchema>
