import { z } from 'zod'

export const collectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  banner_image: z.string().url().optional().nullable(),
  thumbnail_image: z.string().url().optional().nullable(),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  seo_keywords: z.string().optional().nullable(),
})

export type CollectionInput = z.infer<typeof collectionSchema>
