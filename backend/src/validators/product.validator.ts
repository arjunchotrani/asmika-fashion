import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  featured_image: z.string().url().optional().nullable(),
  price: z.number().optional().nullable(),
  stock_quantity: z.number().int().optional().nullable(),
  fabric: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  subcategory_id: z.string().uuid().optional().nullable(),
  collection_id: z.string().uuid().optional().nullable(),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  meta_keywords: z.string().optional().nullable(),
  whatsapp_description: z.string().optional().nullable(),
  gallery: z.array(z.string().url()).optional(),
  color_required: z.boolean().optional(),
  variants: z.array(z.object({
    color: z.string(),
    description: z.string().optional().nullable(),
    images: z.array(z.string()),
    stock_quantity: z.number().int().optional().nullable(),
  })).optional().nullable(),
})

export type ProductInput = z.infer<typeof productSchema>
