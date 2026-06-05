const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8787'

/** Asmika WhatsApp contact number (no + prefix) */
export const WHATSAPP_NUMBER = '918200112608'

/** Fire-and-forget: log a WhatsApp button click as an enquiry */
export function trackWhatsAppClick(productSlug?: string): void {
  fetch(`${API_BASE}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'WhatsApp Visitor',
      phone: '—',
      ...(productSlug ? { product_slug: productSlug } : {}),
      message: 'WhatsApp button click',
    }),
  }).catch(() => {/* silently ignore */})
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string
  display_order: number
}

export interface ProductVariant {
  color: string
  description?: string | null
  images: string[]
  stock_quantity?: number | null
}

export interface Product {
  id: string
  title: string
  slug: string
  description?: string
  price?: number | null
  stock_quantity?: number | null
  status: string
  featured?: boolean
  category_id?: string | null
  subcategory_id?: string | null
  created_at: string
  updated_at: string
  images?: ProductImage[]
  category?: { name: string; slug: string } | null
  subcategory?: { name: string; slug: string } | null
  variants?: ProductVariant[]
  color_required?: boolean
  fabric?: string | null
  size?: string | null
  seo_description?: string | null
  meta_keywords?: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T | null> {
  const { revalidate = 60, ...fetchOptions } = options ?? {}
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      next: { revalidate },
    } as RequestInit)
    if (!res.ok) return null
    const json = await res.json()
    return json.success ? (json.data as T) : null
  } catch {
    return null
  }
}

export function formatPrice(price?: number | null): string {
  if (price == null || price === 0) return 'Price on Enquiry'
  return `₹ ${price.toLocaleString('en-IN')}`
}

export function whatsappUrl(productTitle: string): string {
  const msg = encodeURIComponent(
    `Hi, I'm interested in ${productTitle} from Asmika Fashion. Can you share more details?`
  )
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`
}

export function sortedImages(images?: ProductImage[]): ProductImage[] {
  if (!images || images.length === 0) return []
  return [...images].sort((a, b) => a.display_order - b.display_order)
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  status: string
  created_at: string
  updated_at: string
  subcategories?: { id: string; name: string; slug: string; status: string }[]
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiFetch<Category[]>('/api/categories')
  return (data ?? []).filter((c) => c.status === 'published')
}

export async function getCategory(slug: string): Promise<Category | null> {
  return apiFetch<Category>(`/api/categories/${slug}`)
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface ProductQueryParams {
  collectionId?: string
  categoryId?: string
  featured?: boolean
  status?: string
  sort?: string
  search?: string
}

export async function getProducts(
  params?: ProductQueryParams
): Promise<Product[]> {
  const sp = new URLSearchParams()
  if (params?.categoryId) sp.set('category_id', params.categoryId)
  if (params?.featured) sp.set('featured', 'true')
  if (params?.status) sp.set('status', params.status)
  if (params?.sort) sp.set('sort', params.sort)
  if (params?.search) sp.set('search', params.search)
  const query = sp.toString()
  const data = await apiFetch<Product[]>(`/api/products${query ? `?${query}` : ''}`)
  return data ?? []
}

export async function getProduct(slugOrId: string): Promise<Product | null> {
  return apiFetch<Product>(`/api/products/${slugOrId}`)
}
