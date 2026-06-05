'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Upload,
  X,
  Save,
  ChevronLeft,
  Lock,
  Unlock,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiFetch } from '@/lib/api'
import { cn, slugify } from '@/lib/utils'
import SEOForm from './seo-form'

interface CategoryFormProps {
  initialData?: any
  categoryId?: string
}

export default function CategoryForm({ initialData, categoryId }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isAutoSlug, setIsAutoSlug] = useState(!categoryId)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
    seo_keywords: initialData?.seo_keywords || '',
  })

  const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url || initialData?.thumbnail_url || '')

  useEffect(() => {
    if (isAutoSlug && formData.name) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.name) }))
    }
  }, [formData.name, isAutoSlug])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('folder', 'categories')

      const res = await apiFetch('/api/uploads', { method: 'POST', body: uploadData })
      const data = await res.json()
      if (data.success) {
        setImageUrl(data.data.url)
        toast.success('Image uploaded')
      } else {
        toast.error(data.message || 'Upload failed')
      }
    } catch {
      toast.error('Network error during upload')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const loadingToast = toast.loading(categoryId ? 'Updating category...' : 'Creating category...')

    try {
      const endpoint = categoryId ? `/api/categories/${categoryId}` : '/api/categories'
      const method = categoryId ? 'PUT' : 'POST'

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({ ...formData, thumbnail_url: imageUrl }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(categoryId ? 'Category updated' : 'Category created', { id: loadingToast })
        router.push('/categories')
        router.refresh()
      } else {
        toast.error(data.message || 'Failed to save category', { id: loadingToast })
      }
    } catch {
      toast.error('A network error occurred', { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-10 pb-20">
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
              {categoryId ? 'Edit Category' : 'New Category'}
            </h2>
            <p className="text-sm text-zinc-500">Organize your products into luxury categories.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="luxury-button bg-white text-black px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-2xl disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {categoryId ? 'Update Category' : 'Save Category'}
        </button>
      </div>

      <div className="premium-card-static p-8 space-y-10">
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Category Banner / Image</label>
          <div className="flex items-center gap-8">
            <div className="relative w-40 h-40 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950 overflow-hidden flex items-center justify-center group hover:border-zinc-700 transition-all">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </>
              ) : (
                <div className="text-zinc-600 flex flex-col items-center gap-3">
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Upload Media</span>
                </div>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-bold text-white">Visual Identity</p>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                This image will be the primary visual for this category across the store front. Use high-resolution editorial shots for the best luxury feel.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-10 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Category Name</label>
              <input
                required
                type="text"
                className="w-full premium-input rounded-xl py-3 px-5 text-white text-base font-medium"
                placeholder="e.g. Silk Collection"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Slug (URL)</label>
                <button
                  type="button"
                  onClick={() => setIsAutoSlug(!isAutoSlug)}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all border',
                    isAutoSlug
                      ? 'bg-zinc-800/60 border-white/5 text-zinc-400 hover:border-white/10'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/15'
                  )}
                >
                  {isAutoSlug ? <><Lock className="w-2.5 h-2.5" /> Auto</> : <><Unlock className="w-2.5 h-2.5" /> Custom</>}
                </button>
              </div>
              <input
                required
                type="text"
                className={cn(
                  'w-full premium-input rounded-xl py-3 px-5 font-mono text-sm',
                  isAutoSlug ? 'text-zinc-500' : 'text-zinc-200'
                )}
                placeholder="silk-collection"
                value={formData.slug}
                readOnly={isAutoSlug}
                onChange={(e) => {
                  setIsAutoSlug(false)
                  setFormData({...formData, slug: slugify(e.target.value)})
                }}
              />
              <p className="text-[10px] text-zinc-700 font-mono">
                ashmikafashion.com/categories/
                <span className={cn('transition-colors', formData.slug ? 'text-zinc-400' : 'text-zinc-700')}>
                  {formData.slug || 'your-category-slug'}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description (Optional)</label>
            <textarea
              rows={4}
              className="w-full premium-input rounded-xl py-3 px-5 text-white text-sm resize-none leading-relaxed"
              placeholder="Tell the story of this category..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
      </div>

      <SEOForm
        data={{
          seo_title: formData.seo_title,
          seo_description: formData.seo_description,
          seo_keywords: formData.seo_keywords
        }}
        slug={formData.slug}
        onChange={(seoData) => setFormData(prev => ({ ...prev, ...seoData }))}
        titlePlaceholder={formData.name}
        descriptionPlaceholder={formData.description}
      />
    </form>
  )
}
