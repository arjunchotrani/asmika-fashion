'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Save,
  ChevronLeft,
  Lock,
  Unlock,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiFetch } from '@/lib/api'
import { cn, slugify } from '@/lib/utils'
import SEOForm from './seo-form'

interface SubcategoryFormProps {
  initialData?: any
  subcategoryId?: string
}

export default function SubcategoryForm({ initialData, subcategoryId }: SubcategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [isAutoSlug, setIsAutoSlug] = useState(!subcategoryId)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    category_id: initialData?.category_id || '',
    description: initialData?.description || '',
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
    seo_keywords: initialData?.seo_keywords || '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (isAutoSlug && formData.name) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.name) }))
    }
  }, [formData.name, isAutoSlug])

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/api/categories')
      const data = await res.json()
      if (data.success) setCategories(data.data)
    } catch {
      toast.error('Failed to load categories')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const loadingToast = toast.loading(subcategoryId ? 'Updating subcategory...' : 'Creating subcategory...')

    try {
      const endpoint = subcategoryId ? `/api/subcategories/${subcategoryId}` : '/api/subcategories'
      const method = subcategoryId ? 'PUT' : 'POST'

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(subcategoryId ? 'Subcategory updated' : 'Subcategory created', { id: loadingToast })
        router.push('/subcategories')
        router.refresh()
      } else {
        toast.error(data.message || 'Failed to save subcategory', { id: loadingToast })
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
              {subcategoryId ? 'Edit Subcategory' : 'New Subcategory'}
            </h2>
            <p className="text-sm text-zinc-500">Refine your catalog with luxury subcategories.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="luxury-button bg-white text-black px-8 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-2xl disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {subcategoryId ? 'Update Subcategory' : 'Save Subcategory'}
        </button>
      </div>

      <div className="premium-card-static p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Parent Category</label>
            <select
              required
              className="w-full premium-input rounded-xl py-3 px-5 text-white text-sm appearance-none cursor-pointer"
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Subcategory Name</label>
            <input
              required
              type="text"
              className="w-full premium-input rounded-xl py-3 px-5 text-white text-base font-medium"
              placeholder="e.g. Printed Sarees"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
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
            placeholder="printed-sarees"
            value={formData.slug}
            readOnly={isAutoSlug}
            onChange={(e) => {
              setIsAutoSlug(false)
              setFormData({...formData, slug: slugify(e.target.value)})
            }}
          />
          <p className="text-[10px] text-zinc-700 font-mono">
            asmikafashion.com/subcategories/
            <span className={cn('transition-colors', formData.slug ? 'text-zinc-400' : 'text-zinc-700')}>
              {formData.slug || 'your-subcategory-slug'}
            </span>
          </p>
        </div>

        <div className="space-y-2.5 pt-4 border-t border-white/5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description (Optional)</label>
          <textarea
            rows={4}
            className="w-full premium-input rounded-xl py-3 px-5 text-white text-sm resize-none leading-relaxed"
            placeholder="Brief description..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
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
