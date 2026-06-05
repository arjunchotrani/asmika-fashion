'use client'

import { useState } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SEOFormProps {
  data: {
    seo_title?: string
    seo_description?: string
    seo_keywords?: string
    meta_keywords?: string
  }
  slug?: string
  onChange: (data: any) => void
  titlePlaceholder?: string
  descriptionPlaceholder?: string
  useMetaKeywords?: boolean
}

function CharBar({ count, limit }: { count: number; limit: number }) {
  const pct = Math.min((count / limit) * 100, 100)
  const isOver = count > limit
  const isWarn = count > limit * 0.85

  return (
    <div className="space-y-1.5">
      <div className="h-[3px] rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isOver ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-zinc-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-[10px] font-medium tabular-nums transition-colors',
            count === 0 ? 'text-zinc-700' : isOver ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-zinc-500'
          )}
        >
          {count} / {limit}
        </span>
        {isOver && (
          <span className="text-[10px] text-red-400 font-medium">
            {count - limit} over limit
          </span>
        )}
        {!isOver && count > 0 && (
          <span className="text-[10px] text-zinc-700">
            {limit - count} remaining
          </span>
        )}
      </div>
    </div>
  )
}

export default function SEOForm({
  data,
  slug = '',
  onChange,
  titlePlaceholder = '',
  descriptionPlaceholder = '',
  useMetaKeywords = false,
}: SEOFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  const keywordField = useMetaKeywords ? 'meta_keywords' : 'seo_keywords'
  const titleCount = data.seo_title?.length ?? 0
  const descCount = data.seo_description?.length ?? 0

  const previewTitle = data.seo_title || titlePlaceholder || 'Product Name | Asmika Fashion'
  const previewDesc =
    data.seo_description ||
    descriptionPlaceholder ||
    'Add a meta description to control how this product appears in search results. A compelling summary improves click-through rates.'
  const previewSlug = slug || 'your-product-slug'

  return (
    <div className="premium-card-static overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/[0.02] transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-zinc-900 rounded-xl border border-white/5">
            <Globe className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white tracking-tight">Search Engine Optimization</h3>
            <p className="text-xs text-zinc-500">Control how this product appears in Google.</p>
          </div>
        </div>
        <div className={cn('transition-transform duration-300', isOpen ? 'rotate-180' : '')}>
          <ChevronDown className="w-4 h-4 text-zinc-500" />
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 space-y-8 border-t border-white/5">
          <div className="pt-6 grid gap-6">
            {/* SEO Title */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                SEO Title
              </label>
              <input
                type="text"
                className="w-full premium-input rounded-xl py-2.5 px-4 text-white text-sm"
                placeholder={titlePlaceholder || 'e.g. Vintage Silk Saree | Asmika Fashion'}
                value={data.seo_title || ''}
                onChange={(e) => onChange({ ...data, seo_title: e.target.value })}
              />
              <CharBar count={titleCount} limit={60} />
            </div>

            {/* Meta Description */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Meta Description
              </label>
              <textarea
                rows={3}
                className="w-full premium-input rounded-xl py-2.5 px-4 text-white text-sm resize-none"
                placeholder={
                  descriptionPlaceholder
                    ? `${descriptionPlaceholder.substring(0, 100)}...`
                    : 'Brief description of the product for search results...'
                }
                value={data.seo_description || ''}
                onChange={(e) => onChange({ ...data, seo_description: e.target.value })}
              />
              <CharBar count={descCount} limit={160} />
            </div>

            {/* Keywords */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Keywords</label>
              <input
                type="text"
                className="w-full premium-input rounded-xl py-2.5 px-4 text-white text-sm"
                placeholder="silk saree, ethnic wear, luxury fashion..."
                value={useMetaKeywords ? (data.meta_keywords || '') : (data.seo_keywords || '')}
                onChange={(e) => onChange({ ...data, [keywordField]: e.target.value })}
              />
              <p className="text-[10px] text-zinc-700 italic">Separate keywords with commas.</p>
            </div>
          </div>

          {/* Google Search Preview */}
          <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0a]">
            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Google Preview</span>
            </div>

            <div className="p-5 max-w-[620px]">
              {/* Site identity */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-[11px] font-black text-zinc-900 shrink-0 shadow-sm">
                  A
                </div>
                <div>
                  <p className="text-[12px] text-[#bdc1c6] font-medium leading-none mb-0.5">Asmika Fashion</p>
                  <p className="text-[12px] text-[#4caf50] leading-none">
                    https://ashmikafashion.com › products › <span>{previewSlug}</span>
                  </p>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-[20px] text-[#8ab4f8] leading-snug font-normal mb-1 hover:underline cursor-default line-clamp-1">
                {previewTitle}
              </h3>

              {/* Description */}
              <p className="text-[13px] text-[#bdc1c6] leading-relaxed line-clamp-2">
                {previewDesc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
