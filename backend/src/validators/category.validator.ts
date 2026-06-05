import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  banner_url: z.string().url().optional().nullable(),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  seo_keywords: z.string().optional().nullable(),
})

export const subcategorySchema = categorySchema.extend({
  category_id: z.string().uuid('Invalid category ID'),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type SubcategoryInput = z.infer<typeof subcategorySchema>
