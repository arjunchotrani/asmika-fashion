import { MetadataRoute } from 'next'
import { getCategories, getProducts } from '@/lib/api'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmikafashion.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/categories`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/new-arrivals`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  let categoryPages: MetadataRoute.Sitemap = []
  let productPages: MetadataRoute.Sitemap = []

  try {
    const categories = await getCategories()
    categoryPages = categories
      .filter((c: any) => c.slug && c.status === 'published')
      .map((c: any) => ({
        url: `${SITE_URL}/categories/${c.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
      }))
  } catch {}

  try {
    const products = await getProducts({ status: 'published' })
    productPages = products
      .filter((p: any) => p.slug)
      .map((p: any) => ({
        url: `${SITE_URL}/product/${p.slug}`,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      }))
  } catch {}

  return [...staticPages, ...categoryPages, ...productPages]
}
