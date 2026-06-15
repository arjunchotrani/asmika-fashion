'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Sparkles,
  ChevronLeft,
  Save,
  Lock,
  Unlock,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiFetch } from '@/lib/api'
import { cn, slugify } from '@/lib/utils'
import SEOForm from './seo-form'
import MediaGallery from './media-gallery'

interface VariantDraft {
  _key: string
  color: string
  description: string
  stock_quantity: string
  images: string[]
  uploading: boolean
}

interface ProductFormProps {
  initialData?: any
  productId?: string
}

export default function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [isAutoSlug, setIsAutoSlug] = useState(!productId)

  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    stock_quantity: initialData?.stock_quantity || '',
    category_id: initialData?.category_id || '',
    subcategory_id: initialData?.subcategory_id || '',
    status: initialData?.status || 'draft',
    featured: initialData?.featured ?? false,
    fabric: initialData?.fabric || '',
    size: initialData?.size || '',
    color_required: initialData?.color_required ?? false,
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
    meta_keywords: initialData?.meta_keywords || '',
  })

  const [variants, setVariants] = useState<VariantDraft[]>(() =>
    (initialData?.variants ?? []).map((v: any) => ({
      _key: crypto.randomUUID(),
      color: v.color || '',
      description: v.description || '',
      stock_quantity: v.stock_quantity?.toString() ?? '',
      images: v.images || [],
      uploading: false,
    }))
  )

  const [images, setImages] = useState<string[]>(() => {
    if (initialData?.gallery) return initialData.gallery
    if (initialData?.images) {
      return initialData.images.map((img: any) => (typeof img === 'string' ? img : img.url))
    }
    return []
  })

  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])

  useEffect(() => {
    fetchMetadata()
  }, [])

  useEffect(() => {
    if (isAutoSlug && formData.name) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.name) }))
    }
  }, [formData.name, isAutoSlug])

  const fetchMetadata = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        apiFetch('/api/categories'),
        apiFetch('/api/subcategories'),
      ])
      const [catData, subData] = await Promise.all([
        catRes.json(),
        subRes.json(),
      ])
      if (catData.success) setCategories(catData.data)
      if (subData.success) setSubcategories(subData.data)
    } catch {
      toast.error('Failed to load categories')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadingCount(files.length)
    let live = [...images]
    let successCount = 0

    try {
      for (let i = 0; i < files.length; i++) {
        const uploadData = new FormData()
        uploadData.append('file', files[i])
        uploadData.append('folder', 'products')

        const res = await apiFetch('/api/uploads', { method: 'POST', body: uploadData })
        const data = await res.json()
        if (data.success) {
          live = [...live, data.data.url]
          setImages(live) // update grid live as each file finishes
          successCount++
        }
      }
      if (successCount > 0) {
        toast.success(`${successCount} image${successCount !== 1 ? 's' : ''} uploaded`)
      }
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
      setUploadingCount(0)
      e.target.value = ''
    }
  }

  // ── Variant helpers ───────────────────────────────────────
  const addVariant = () =>
    setVariants(prev => [...prev, { _key: crypto.randomUUID(), color: '', description: '', stock_quantity: '', images: [], uploading: false }])

  const removeVariant = (idx: number) =>
    setVariants(prev => prev.filter((_, i) => i !== idx))

  const updateVariant = (idx: number, field: keyof Omit<VariantDraft, '_key' | 'uploading' | 'images'>, value: string) =>
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))

  const removeVariantImage = (vIdx: number, imgIdx: number) =>
    setVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, images: v.images.filter((_, j) => j !== imgIdx) } : v))

  const handleVariantImageUpload = async (vIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, uploading: true } : v))
    let live = [...variants[vIdx].images]
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData()
        fd.append('file', files[i])
        fd.append('folder', 'products')
        const res = await apiFetch('/api/uploads', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.success) { live = [...live, data.data.url] }
      }
      setVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, images: live } : v))
    } catch {
      toast.error('Image upload failed')
    } finally {
      setVariants(prev => prev.map((v, i) => i === vIdx ? { ...v, uploading: false } : v))
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) {
      toast.error('Add at least one product image')
      return
    }

    setLoading(true)
    const loadingToast = toast.loading(productId ? 'Updating product...' : 'Creating product...')

    const payload = {
      title: formData.name,
      slug: formData.slug,
      description: formData.description,
      status: formData.status,
      featured: formData.featured,
      category_id: formData.category_id || null,
      subcategory_id: formData.subcategory_id || null,
      gallery: images,
      price: formData.price !== '' ? parseFloat(formData.price as string) : null,
      stock_quantity: formData.stock_quantity !== '' ? parseInt(formData.stock_quantity as string) : null,
      fabric: formData.fabric,
      size: formData.size,
      color_required: formData.color_required,
      variants: variants.filter(v => v.color.trim()).map(v => ({
        color: v.color.trim(),
        description: v.description || null,
        images: v.images,
        stock_quantity: v.stock_quantity !== '' ? parseInt(v.stock_quantity) : null,
      })),
      seo_title: formData.seo_title || null,
      seo_description: formData.seo_description || null,
      meta_keywords: formData.meta_keywords || null,
    }

    try {
      const endpoint = productId ? `/api/products/${productId}` : '/api/products'
      const method = productId ? 'PUT' : 'POST'
      const res = await apiFetch(endpoint, { method, body: JSON.stringify(payload) })
      const data = await res.json()
      if (data.success) {
        toast.success(productId ? 'Product updated' : 'Product created', { id: loadingToast })
        router.push('/products')
        router.refresh()
      } else {
        toast.error(data.message || 'Failed to save product', { id: loadingToast })
      }
    } catch {
      toast.error('A network error occurred', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const openChatGPT = () => {
    const name = formData.name.trim()
    if (!name) {
      toast.error('Enter a product name first')
      return
    }

    const colors = variants.map(v => v.color).filter(Boolean)

    const lines: string[] = []
    lines.push(`You are a luxury copywriter for Asmika Fashion, a premium Indian ethnic textile brand.`)
    lines.push(``)
    lines.push(`Write 4 distinct product copy outputs for the following specific product. Every sentence must be grounded in the actual product details provided — do NOT use generic filler phrases that could apply to any garment.`)
    lines.push(``)
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(`PRODUCT: ${name}`)
    if (formData.fabric.trim()) lines.push(`FABRIC: ${formData.fabric.trim()}`)
    if (formData.size.trim()) lines.push(`SIZE: ${formData.size.trim()}`)
    if (colors.length > 0) lines.push(`COLOURS: ${colors.join(', ')}`)
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(``)
    lines.push(`STRICT RULES:`)
    lines.push(`- Each description: 120–150 words`)
    lines.push(`- Mention "${name}" by name at least once`)
    if (formData.fabric.trim()) lines.push(`- Reference the fabric "${formData.fabric.trim()}" specifically — describe its texture, drape, or feel`)
    if (colors.length > 0) lines.push(`- Mention the colour(s) ${colors.map(c => `"${c}"`).join(', ')} naturally within the text`)
    if (formData.size.trim()) lines.push(`- Include the size "${formData.size.trim()}" where relevant`)
    lines.push(`- SEO keywords to weave in naturally: Indian ethnic wear, handcrafted, luxury, artisan craftsmanship, traditional`)
    lines.push(`- Third person. No bullet points. No generic lines like "perfect for any occasion" or "timeless elegance" unless rewritten uniquely.`)
    lines.push(`- IMPORTANT: Place the text of EACH option inside a plain code block (triple backticks) so I can copy it with one click. The label/heading goes OUTSIDE the code block.`)
    lines.push(``)
    lines.push(`════════════════════════════════════`)
    lines.push(`OPTION 1 — POETIC & EVOCATIVE`)
    lines.push(`════════════════════════════════════`)
    lines.push(`Romantic, sensory, cinematic. Describe how this specific fabric feels, how the colours come alive, the heritage behind the craft. Make it unique to this product.`)
    lines.push(`Put the description text inside a code block.`)
    lines.push(``)
    lines.push(`════════════════════════════════════`)
    lines.push(`OPTION 2 — INFORMATIVE & SEO-RICH`)
    lines.push(`════════════════════════════════════`)
    lines.push(`Confident, editorial tone. Lead with the product name and fabric. Detail the craftsmanship, occasion-suitability, colour options, and what sets this specific piece apart. Pack in search keywords naturally.`)
    lines.push(`Put the description text inside a code block.`)
    lines.push(``)
    lines.push(`════════════════════════════════════`)
    lines.push(`OPTION 3 — STORYTELLING & HERITAGE`)
    lines.push(`════════════════════════════════════`)
    lines.push(`Warm, narrative. Ground the story in what makes THIS garment and its fabric unique — the tradition, the weave, the region. Weave SEO keywords through naturally.`)
    lines.push(`Put the description text inside a code block.`)
    lines.push(``)
    lines.push(`════════════════════════════════════`)
    lines.push(`SEO META DESCRIPTION`)
    lines.push(`════════════════════════════════════`)
    lines.push(`Under 160 characters. Include "${name}"${formData.fabric.trim() ? `, "${formData.fabric.trim()}"` : ''}, and 1–2 strong search terms. Must be click-worthy for Google search results.`)
    lines.push(`Put the meta description inside a code block.`)
    lines.push(``)
    lines.push(`════════════════════════════════════`)
    lines.push(`SEO KEYWORDS`)
    lines.push(`════════════════════════════════════`)
    lines.push(`Generate 10–15 comma-separated SEO keywords for this product. Mix short-tail (e.g. "mal chanderi suit") and long-tail (e.g. "handcrafted mal chanderi suit for women"). Include fabric, product type, occasion, and Indian ethnic wear terms.`)
    lines.push(`Put the keywords inside a code block as a single comma-separated line.`)

    const prompt = lines.join('\n')

    navigator.clipboard.writeText(prompt)
      .then(() => {
        toast.success('Prompt copied — paste it into ChatGPT!')
        window.open('https://chatgpt.com', '_blank')
      })
      .catch(() => {
        window.open('https://chatgpt.com', '_blank')
        toast('Clipboard blocked — paste manually in ChatGPT.')
      })
  }

  const descCount = formData.description.length

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 bg-zinc-900 border border-white/5 rounded-full text-zinc-500 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {productId ? 'Edit Product' : 'New Product'}
            </h2>
            <p className="text-sm text-zinc-500">Manage your luxury product details and inventory.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm font-bold text-zinc-400 hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="luxury-button bg-white text-black px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-2xl disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {productId ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Product Details */}
          <section className="premium-card-static p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Product Details</h3>
            </div>

            <div className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  Product Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full premium-input rounded-xl py-3 px-5 text-white text-base font-medium"
                  placeholder="e.g. Vintage Silk Saree"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAutoSlug(!isAutoSlug)}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all border',
                      isAutoSlug
                        ? 'bg-zinc-800/60 border-white/5 text-zinc-400 hover:border-white/10'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/15'
                    )}
                    title={isAutoSlug ? 'Slug is auto-generated — click to edit manually' : 'Click to re-enable auto-generation'}
                  >
                    {isAutoSlug ? (
                      <><Lock className="w-2.5 h-2.5" /> Auto</>
                    ) : (
                      <><Unlock className="w-2.5 h-2.5" /> Custom</>
                    )}
                  </button>
                </div>
                <input
                  required
                  type="text"
                  className={cn(
                    'w-full premium-input rounded-xl py-3 px-5 font-mono text-sm',
                    isAutoSlug ? 'text-zinc-500' : 'text-zinc-200'
                  )}
                  placeholder="vintage-silk-saree"
                  value={formData.slug}
                  readOnly={isAutoSlug}
                  onChange={(e) => {
                    setIsAutoSlug(false)
                    setFormData({ ...formData, slug: slugify(e.target.value) })
                  }}
                />
                <p className="text-[10px] text-zinc-700 font-mono">
                  asmikafashion.com/products/
                  <span className={cn(
                    'transition-colors',
                    formData.slug ? 'text-zinc-400' : 'text-zinc-700'
                  )}>
                    {formData.slug || 'your-product-slug'}
                  </span>
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Description
                  </label>
                  <span className={cn(
                    'text-[10px] font-medium transition-colors',
                    descCount === 0 ? 'text-zinc-700' : descCount > 1000 ? 'text-amber-500' : 'text-zinc-600'
                  )}>
                    {descCount} chars
                  </span>
                </div>
                <textarea
                  rows={8}
                  className="w-full premium-input rounded-xl py-3 px-5 text-white text-sm resize-none leading-relaxed"
                  placeholder="Describe the aesthetic, craftsmanship, and materials..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </section>

          <MediaGallery
            images={images}
            uploading={uploading}
            uploadingCount={uploadingCount}
            onReorder={setImages}
            onRemove={(idx) => setImages(images.filter((_, i) => i !== idx))}
            onUpload={handleImageUpload}
          />

          {/* Pricing & Inventory */}
          <section className="premium-card-static p-8 space-y-8">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-4">
              Pricing & Inventory
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Price (INR)</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 font-bold group-focus-within:text-zinc-300 transition-colors">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full premium-input rounded-xl py-3 pl-10 pr-5 text-white text-lg font-bold"
                    placeholder="Leave blank for Price on Enquiry"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  className="w-full premium-input rounded-xl py-3 px-5 text-white text-lg font-bold"
                  placeholder="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Color Variants */}
          <section className="premium-card-static p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Color Variants</h3>
                <p className="text-[10px] text-zinc-700 mt-1">Each variant has its own images, description &amp; stock.</p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-white/5 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-white transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Variant
              </button>
            </div>

            {/* Color required toggle */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, color_required: !prev.color_required }))}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border w-full transition-all duration-200',
                formData.color_required
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
              )}
            >
              <div className={cn('relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0', formData.color_required ? 'bg-amber-500' : 'bg-zinc-700')}>
                <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200', formData.color_required ? 'translate-x-4' : 'translate-x-0.5')} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{formData.color_required ? 'Color selection required' : 'Color selection optional'}</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  {formData.color_required ? 'Customer must pick a color before enquiring.' : 'Customer can enquire without selecting a color.'}
                </p>
              </div>
            </button>

            {variants.length === 0 && (
              <p className="text-center text-[11px] text-zinc-700 py-4">No variants yet — click "Add Variant" to start.</p>
            )}

            <div className="space-y-4">
              {variants.map((variant, vIdx) => (
                <div key={variant._key} className="border border-zinc-800 rounded-xl p-5 space-y-5 bg-zinc-950/40">

                  {/* Header row: color name + remove */}
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500/50 shrink-0" />
                    <input
                      type="text"
                      placeholder="Color name (e.g. Ivory White)"
                      value={variant.color}
                      onChange={(e) => updateVariant(vIdx, 'color', e.target.value)}
                      className="flex-1 bg-transparent text-sm font-semibold text-white placeholder:text-zinc-700 outline-none border-b border-zinc-800 focus:border-zinc-600 pb-1 transition-colors"
                    />
                    <button type="button" onClick={() => removeVariant(vIdx)} className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Stock for this color</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={variant.stock_quantity}
                      onChange={(e) => updateVariant(vIdx, 'stock_quantity', e.target.value)}
                      className="w-full premium-input rounded-lg py-2 px-3 text-white text-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                      Description <span className="text-zinc-700 normal-case font-normal">(optional — overrides main)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe this color variant..."
                      value={variant.description}
                      onChange={(e) => updateVariant(vIdx, 'description', e.target.value)}
                      className="w-full premium-input rounded-lg py-2 px-3 text-white text-sm resize-none leading-relaxed"
                    />
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Images for this color</label>
                    <div className="grid grid-cols-5 gap-2">
                      {variant.images.map((url, imgIdx) => (
                        <div key={imgIdx} className="relative aspect-square group">
                          <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-zinc-800" />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(vIdx, imgIdx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                      <label className={cn(
                        'aspect-square border border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors',
                        variant.uploading && 'pointer-events-none opacity-50'
                      )}>
                        {variant.uploading
                          ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                          : <Plus className="w-4 h-4 text-zinc-500" />}
                        <span className="text-[9px] text-zinc-600 mt-1">Add</span>
                        <input type="file" multiple accept="image/*" className="sr-only" onChange={(e) => handleVariantImageUpload(vIdx, e)} />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <SEOForm
            data={{
              seo_title: formData.seo_title,
              seo_description: formData.seo_description,
              meta_keywords: formData.meta_keywords,
            }}
            slug={formData.slug}
            onChange={(seoData) => setFormData(prev => ({ ...prev, ...seoData }))}
            titlePlaceholder={formData.name ? `${formData.name} | Asmika Fashion` : ''}
            descriptionPlaceholder={formData.description}
            useMetaKeywords={true}
          />
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Smart Formatter */}
          <section className="premium-card-static p-6 space-y-5 border border-amber-500/10">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <h3 className="text-xs font-bold text-amber-500/80 uppercase tracking-[0.2em]">Smart Formatter</h3>
            </div>

            {/* Prompt preview */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Will include</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${formData.name.trim() ? 'bg-amber-500' : 'bg-zinc-700'}`} />
                  <span className="text-[11px] text-zinc-500">
                    {formData.name.trim() ? `Product: ${formData.name}` : 'Product name (required)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${formData.fabric.trim() ? 'bg-amber-500' : 'bg-zinc-700'}`} />
                  <span className="text-[11px] text-zinc-500">
                    {formData.fabric.trim() ? `Fabric: ${formData.fabric}` : 'Fabric (not set)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${formData.size.trim() ? 'bg-amber-500' : 'bg-zinc-700'}`} />
                  <span className="text-[11px] text-zinc-500">
                    {formData.size.trim() ? `Size: ${formData.size}` : 'Size (not set)'}
                  </span>
                </div>
                {variants.filter(v => v.color).length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
                    <span className="text-[11px] text-zinc-500">
                      Colours: {variants.filter(v => v.color).map(v => v.color).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={openChatGPT}
              disabled={!formData.name.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {formData.name.trim() ? 'Copy Prompt & Open ChatGPT' : 'Enter a product name first'}
            </button>

            <p className="text-[10px] text-zinc-700 text-center leading-relaxed">
              Copies a structured prompt → opens ChatGPT → paste &amp; get 3 ready-to-copy descriptions
            </p>
          </section>

          {/* Organization */}
          <section className="premium-card-static p-8 space-y-8">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-4">
              Organization
            </h3>
            <div className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</label>
                <select
                  className="w-full premium-input rounded-xl py-3 px-5 text-white text-sm appearance-none cursor-pointer"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Featured</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200',
                    formData.featured
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  )}
                >
                  <div className={cn(
                    'relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0',
                    formData.featured ? 'bg-amber-500' : 'bg-zinc-700'
                  )}>
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                      formData.featured ? 'translate-x-4' : 'translate-x-0.5'
                    )} />
                  </div>
                  <span className="text-sm font-semibold">
                    {formData.featured ? 'Featured product' : 'Not featured'}
                  </span>
                </button>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Category</label>
                <select
                  className="w-full premium-input rounded-xl py-3 px-5 text-white text-sm appearance-none cursor-pointer"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Subcategory</label>
                <select
                  className="w-full premium-input rounded-xl py-3 px-5 text-white text-sm appearance-none cursor-pointer"
                  value={formData.subcategory_id}
                  onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                >
                  <option value="">None</option>
                  {subcategories
                    .filter(s => s.category_id === formData.category_id)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
              </div>

            </div>
          </section>

          {/* Specifications */}
          <section className="premium-card-static p-8 space-y-8">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 pb-4">
              Specifications
            </h3>
            <div className="space-y-6">
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fabric</label>
                <input
                  type="text"
                  className="w-full premium-input rounded-xl py-3 px-5 text-white text-sm"
                  placeholder="e.g. Mulberry Silk"
                  value={formData.fabric}
                  onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Size</label>
                <input
                  type="text"
                  className="w-full premium-input rounded-xl py-3 px-5 text-white text-sm"
                  placeholder="e.g. XL, 42, Free Size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}
