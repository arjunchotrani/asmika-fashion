'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import {
  Plus, Search, Edit2, Trash2, Package, Star, ChevronDown,
  ChevronLeft, ChevronRight, Copy, ExternalLink, Archive,
  MoreHorizontal, Filter, ArrowUpDown, Link2, X,
} from 'lucide-react'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  title: string
  slug: string
  description?: string
  price?: number
  stock_quantity?: number
  status: string
  featured?: boolean
  category_id?: string
  subcategory_id?: string
  collection_id?: string
  created_at?: string
  updated_at?: string
  category?: { name: string }
  images?: { url: string }[]
}

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string }> = {
  draft:     { label: 'Draft',     dot: 'bg-zinc-500',  badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
  published: { label: 'Published', dot: 'bg-green-500', badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
  archived:  { label: 'Archived',  dot: 'bg-red-500',   badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  active:    { label: 'Active',    dot: 'bg-green-500', badge: 'bg-green-500/10 text-green-400 border-green-500/20' },
}
const sCfg = (s: string) => STATUS_CFG[s] ?? STATUS_CFG.draft

const SORT_OPTS = [
  { value: 'newest',  label: 'Newest first' },
  { value: 'oldest',  label: 'Oldest first' },
  { value: 'alpha',   label: 'A → Z' },
  { value: 'updated', label: 'Last updated' },
]

const PER_PAGE = [10, 25, 50]

function rel(dateStr?: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr), now = Date.now(), diff = now - d.getTime()
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), day = Math.floor(diff / 86400000)
  if (m < 2) return 'Just now'
  if (h < 1) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (day === 1) return 'Yesterday'
  if (day < 7) return `${day}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: day > 365 ? 'numeric' : undefined })
}

function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-800/60 animate-pulse">
      <td className="pl-6 pr-3 py-4"><div className="w-4 h-4 rounded bg-zinc-800" /></td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-zinc-800 shrink-0" />
          <div className="space-y-2">
            <div className="h-4 bg-zinc-800 rounded w-40" />
            <div className="h-3 bg-zinc-800 rounded w-24" />
          </div>
        </div>
      </td>
      <td className="px-4 py-4"><div className="h-6 bg-zinc-800 rounded-full w-20" /></td>
      <td className="px-4 py-4 hidden md:table-cell"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
      <td className="px-4 py-4"><div className="h-4 bg-zinc-800 rounded w-16" /></td>
      <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-zinc-800 rounded w-10" /></td>
      <td className="px-4 py-4 hidden lg:table-cell"><div className="w-4 h-4 bg-zinc-800 rounded-full" /></td>
      <td className="px-4 py-4 hidden xl:table-cell"><div className="h-3 bg-zinc-800 rounded w-16" /></td>
      <td className="pr-6 py-4"><div className="h-8 w-8 bg-zinc-800 rounded-lg ml-auto" /></td>
    </tr>
  )
}

function EmptyState({ type, term }: { type: 'empty' | 'search' | 'filter'; term?: string }) {
  const config = {
    empty:  { icon: <Package className="w-7 h-7 text-zinc-600" />, title: 'No products yet', sub: 'Start building your luxury catalog.' },
    search: { icon: <Search className="w-6 h-6 text-zinc-600" />,  title: `No results for "${term}"`, sub: 'Try a different title or slug.' },
    filter: { icon: <Filter className="w-6 h-6 text-zinc-600" />,  title: 'No products match your filters', sub: 'Try adjusting or clearing your filters.' },
  }[type]

  return (
    <tr>
      <td colSpan={9}>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-inner">
            {config.icon}
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">{config.title}</p>
            <p className="text-zinc-500 text-sm mt-1">{config.sub}</p>
          </div>
          {type === 'empty' && (
            <Link href="/products/create" className="mt-1 bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-colors">
              <Plus className="w-4 h-4" /> Add first product
            </Link>
          )}
        </div>
      </td>
    </tr>
  )
}

interface MenuPos { productId: string; top: number; right: number }

export default function ProductsPage() {
  // ── State ─────────────────────────────────────────────────
  const [products, setProducts]     = useState<Product[]>([])
  const [loading, setLoading]       = useState(true)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [searchTerm,      setSearchTerm]      = useState('')
  const [statusFilter,    setStatusFilter]    = useState('')
  const [categoryFilter,  setCategoryFilter]  = useState('')
  const [featuredOnly,    setFeaturedOnly]    = useState(false)
  const [sortBy,          setSortBy]          = useState('newest')

  const [page,    setPage]    = useState(1)
  const [perPage, setPerPage] = useState(25)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const selectAllRef = useRef<HTMLInputElement>(null)

  const [actionMenu, setActionMenu] = useState<MenuPos | null>(null)
  const [statusMenu, setStatusMenu] = useState<MenuPos | null>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  // ── Computed ──────────────────────────────────────────────
  const processed = useMemo(() => {
    let list = [...products]
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
    }
    if (statusFilter)    list = list.filter(p => p.status === statusFilter)
    if (categoryFilter)  list = list.filter(p => p.category?.name === categoryFilter)
    if (featuredOnly)    list = list.filter(p => p.featured)
    switch (sortBy) {
      case 'oldest':  list.sort((a, b) => +new Date(a.created_at ?? 0) - +new Date(b.created_at ?? 0)); break
      case 'alpha':   list.sort((a, b) => a.title.localeCompare(b.title)); break
      case 'updated': list.sort((a, b) => +new Date(b.updated_at ?? 0) - +new Date(a.updated_at ?? 0)); break
      default:        list.sort((a, b) => +new Date(b.created_at ?? 0) - +new Date(a.created_at ?? 0))
    }
    return list
  }, [products, searchTerm, statusFilter, categoryFilter, featuredOnly, sortBy])

  const totalPages       = Math.max(1, Math.ceil(processed.length / perPage))
  const paginated        = useMemo(() => processed.slice((page - 1) * perPage, page * perPage), [processed, page, perPage])
  const hasFilters       = !!(searchTerm || statusFilter || categoryFilter || featuredOnly)
  const allOnPageSel     = paginated.length > 0 && paginated.every(p => selected.has(p.id))
  const activeProduct    = products.find(p => p.id === (actionMenu?.productId ?? statusMenu?.productId))

  // ── Fetch ─────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pr, cr] = await Promise.all([
        apiFetch('/api/products'),
        apiFetch('/api/categories'),
      ])
      const [pd, cd] = await Promise.all([pr.json(), cr.json()])
      if (pd.success)  setProducts(pd.data)
      else toast.error(pd.message || 'Failed to load products')
      if (cd.success)  setCategories(cd.data)
    } catch { toast.error('Cannot reach the server') }
    finally  { setLoading(false) }
  }

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => { fetchAll() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node
      if (actionMenuRef.current?.contains(t) || statusMenuRef.current?.contains(t)) return
      setActionMenu(null)
      setStatusMenu(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => { setPage(1) }, [searchTerm, statusFilter, categoryFilter, featuredOnly, sortBy, perPage])

  // Indeterminate state on select-all checkbox
  useEffect(() => {
    const node = selectAllRef.current
    if (!node) return
    const count = paginated.filter(p => selected.has(p.id)).length
    node.indeterminate = count > 0 && count < paginated.length
  }, [paginated, selected])

  // ── Handlers ──────────────────────────────────────────────
  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const toggleSelectAll = () => {
    const ids = paginated.map(p => p.id)
    if (allOnPageSel) setSelected(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n })
    else              setSelected(prev => { const n = new Set(prev); ids.forEach(id => n.add(id));    return n })
  }

  const clearSelection = () => setSelected(new Set())

  const clearFilters = () => {
    setSearchTerm(''); setStatusFilter(''); setCategoryFilter(''); setFeaturedOnly(false)
  }

  const deleteProduct = async (id: string) => {
    setActionMenu(null)
    if (!confirm('Delete this product? This cannot be undone.')) return
    const tid = toast.loading('Deleting...')
    try {
      const res = await apiFetch(`/api/products/${id}`, { method: 'DELETE' })
      const d = await res.json()
      if (d.success) {
        setProducts(prev => prev.filter(p => p.id !== id))
        setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
        toast.success('Product deleted', { id: tid })
      } else toast.error(d.message || 'Delete failed', { id: tid })
    } catch { toast.error('Network error', { id: tid }) }
  }

  const duplicateProduct = async (product: Product) => {
    setActionMenu(null)
    const tid = toast.loading('Duplicating...')
    try {
      const gallery = product.images?.map(img => img.url) ?? []
      const res = await apiFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify({
          title: `${product.title} (Copy)`,
          slug: `${product.slug}-copy-${Date.now()}`,
          description: product.description,
          status: 'draft',
          featured: false,
          category_id: product.category_id ?? null,
          subcategory_id: product.subcategory_id ?? null,
          collection_id: product.collection_id ?? null,
          gallery,
        }),
      })
      const d = await res.json()
      if (d.success) { toast.success('Duplicated as draft', { id: tid }); fetchAll() } // eslint-disable-line react-hooks/exhaustive-deps
      else toast.error(d.message || 'Duplication failed', { id: tid })
    } catch { toast.error('Network error', { id: tid }) }
  }

  const changeStatus = async (id: string, newStatus: string) => {
    setActionMenu(null); setStatusMenu(null)
    try {
      const res = await apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
      const d = await res.json()
      if (d.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
        toast.success(`Marked as ${newStatus}`)
      } else toast.error(d.message || 'Update failed')
    } catch { toast.error('Network error') }
  }

  const bulkAction = async (action: 'publish' | 'archive' | 'delete') => {
    if (action === 'delete' && !confirm(`Delete ${selected.size} products? This cannot be undone.`)) return
    const ids = Array.from(selected)
    const verb = action === 'delete' ? 'Deleting' : action === 'publish' ? 'Publishing' : 'Archiving'
    const tid = toast.loading(`${verb} ${ids.length} products…`)
    try {
      await Promise.all(ids.map(id =>
        action === 'delete'
          ? apiFetch(`/api/products/${id}`, { method: 'DELETE' })
          : apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify({ status: action === 'publish' ? 'published' : 'archived' }) })
      ))
      if (action === 'delete') {
        setProducts(prev => prev.filter(p => !ids.includes(p.id)))
      } else {
        const s = action === 'publish' ? 'published' : 'archived'
        setProducts(prev => prev.map(p => ids.includes(p.id) ? { ...p, status: s } : p))
      }
      clearSelection()
      toast.success(`${ids.length} products ${action === 'delete' ? 'deleted' : action === 'publish' ? 'published' : 'archived'}`, { id: tid })
    } catch { toast.error('Bulk action failed', { id: tid }) }
  }

  const copyUrl = (slug: string) => {
    setActionMenu(null)
    navigator.clipboard.writeText(`https://ashmikafashion.com/products/${slug}`)
      .then(() => toast.success('URL copied'))
      .catch(() => toast.error('Copy failed'))
  }

  const openStatusMenu = (e: React.MouseEvent<HTMLButtonElement>, productId: string) => {
    e.stopPropagation()
    const r = e.currentTarget.getBoundingClientRect()
    setStatusMenu({ productId, top: r.bottom + 6, right: window.innerWidth - r.right })
    setActionMenu(null)
  }

  const openActionMenu = (e: React.MouseEvent<HTMLButtonElement>, productId: string) => {
    e.stopPropagation()
    const r = e.currentTarget.getBoundingClientRect()
    setActionMenu({ productId, top: r.bottom + 6, right: window.innerWidth - r.right })
    setStatusMenu(null)
  }

  // Empty state discriminator
  const emptyType: 'empty' | 'search' | 'filter' | null =
    loading             ? null     :
    products.length === 0 ? 'empty' :
    paginated.length === 0 && searchTerm ? 'search' :
    paginated.length === 0 ? 'filter' : null

  // Page number list with ellipsis
  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
    .reduce<(number | '…')[]>((acc, n, i, arr) => {
      if (i > 0 && (n as number) - (arr[i - 1] as number) > 1) acc.push('…')
      acc.push(n)
      return acc
    }, [])

  return (
    <div className="space-y-4">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Products</h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            {loading ? 'Loading…' : `${processed.length} of ${products.length} product${products.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/products/create" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-colors shrink-0">
          <Plus className="w-4 h-4" /> New Product
        </Link>
      </div>

      {/* ── Filter bar ──────────────────────────────────────── */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title or slug…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-600 placeholder:text-zinc-600"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-sm text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-3 text-sm text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>


        <button
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
            featuredOnly
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
          )}
        >
          <Star className={cn('w-3.5 h-3.5', featuredOnly && 'fill-amber-400')} />
          Featured
        </button>

        <div className="relative ml-auto">
          <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-3 text-sm text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer appearance-none">
            {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {hasFilters && (
          <button onClick={clearFilters}
            className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-white transition-colors px-2 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* ── Bulk actions bar ────────────────────────────────── */}
      {selected.size > 0 && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
          <span className="text-sm font-bold text-white">{selected.size} selected</span>
          <div className="h-4 w-px bg-zinc-700" />
          <button onClick={() => bulkAction('publish')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-green-400 hover:bg-green-500/10 transition-all">
            Publish
          </button>
          <button onClick={() => bulkAction('archive')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all">
            Archive
          </button>
          <button onClick={() => bulkAction('delete')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-red-400 hover:bg-red-500/10 transition-all">
            Delete
          </button>
          <button onClick={clearSelection} className="ml-auto text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
                <th className="pl-6 pr-3 py-3.5 w-10">
                  <input ref={selectAllRef} type="checkbox" checked={allOnPageSel} onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 cursor-pointer accent-white" />
                </th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.14em]">Product</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.14em]">Status</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.14em] hidden md:table-cell">Category</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.14em]">Price</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.14em] hidden lg:table-cell">Stock</th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.14em] hidden lg:table-cell">
                  <Star className="w-3 h-3" />
                </th>
                <th className="px-4 py-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.14em] hidden xl:table-cell">Updated</th>
                <th className="pr-6 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading
                ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
                : emptyType
                  ? <EmptyState type={emptyType} term={searchTerm} />
                  : paginated.map(product => {
                    const cfg = sCfg(product.status)
                    const isSel = selected.has(product.id)
                    return (
                      <tr key={product.id}
                        className={cn('group transition-colors duration-100', isSel ? 'bg-white/[0.025]' : 'hover:bg-zinc-800/35')}>

                        {/* Checkbox */}
                        <td className="pl-6 pr-3 py-4">
                          <input type="checkbox" checked={isSel} onChange={() => toggleSelect(product.id)}
                            onClick={e => e.stopPropagation()}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 cursor-pointer accent-white" />
                        </td>

                        {/* Product */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0">
                              {product.images?.[0]?.url
                                ? <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                                : <Package className="w-4 h-4 text-zinc-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate max-w-[220px] leading-snug">{product.title}</p>
                              <p className="text-[11px] text-zinc-600 font-mono truncate max-w-[220px] mt-0.5 leading-none">/{product.slug}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <button
                            onClick={e => openStatusMenu(e, product.id)}
                            onMouseDown={e => e.stopPropagation()}
                            className={cn(
                              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all hover:opacity-80 whitespace-nowrap',
                              cfg.badge
                            )}
                          >
                            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
                            {cfg.label}
                            <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                          </button>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-zinc-400 truncate max-w-[140px] block">
                            {product.category?.name ?? <span className="text-zinc-700">—</span>}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-semibold text-white tabular-nums">
                            {product.price ? `₹${product.price.toLocaleString('en-IN')}` : <span className="text-zinc-700 font-normal">—</span>}
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className={cn('text-sm font-medium tabular-nums',
                            product.stock_quantity === 0 ? 'text-red-400' :
                            (product.stock_quantity ?? 99) < 5 ? 'text-amber-400' :
                            'text-zinc-400'
                          )}>
                            {product.stock_quantity ?? <span className="text-zinc-700">—</span>}
                          </span>
                        </td>

                        {/* Featured */}
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          {product.featured
                            ? <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            : <span className="text-zinc-800">—</span>}
                        </td>

                        {/* Updated */}
                        <td className="px-4 py-3.5 hidden xl:table-cell">
                          <span className="text-[11px] text-zinc-600 tabular-nums">{rel(product.updated_at)}</span>
                        </td>

                        {/* Actions */}
                        <td className="pr-6 py-3.5">
                          <button
                            onClick={e => openActionMenu(e, product.id)}
                            onMouseDown={e => e.stopPropagation()}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-white hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────── */}
        {!loading && products.length > 0 && (
          <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-4">
            {/* Per page */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="hidden sm:inline">Show</span>
              {PER_PAGE.map(n => (
                <button key={n} onClick={() => setPerPage(n)}
                  className={cn('w-8 h-7 rounded-lg text-xs font-bold transition-all',
                    perPage === n ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-800')}>
                  {n}
                </button>
              ))}
              <span className="hidden sm:inline">per page</span>
            </div>

            {/* Count */}
            <span className="text-xs text-zinc-500 order-last sm:order-none">
              {processed.length > 0 && (
                <>
                  <span className="text-zinc-200 font-semibold tabular-nums">
                    {(page - 1) * perPage + 1}–{Math.min(page * perPage, processed.length)}
                  </span>
                  {' '}of{' '}
                  <span className="text-zinc-200 font-semibold tabular-nums">{processed.length}</span>
                </>
              )}
            </span>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-25 disabled:pointer-events-none transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNums.map((n, i) =>
                n === '…'
                  ? <span key={`e${i}`} className="w-8 flex items-center justify-center text-zinc-600 text-xs">…</span>
                  : <button key={n} onClick={() => setPage(n as number)}
                      className={cn('w-8 h-8 rounded-lg text-xs font-bold transition-all',
                        page === n ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800')}>
                      {n}
                    </button>
              )}

              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-25 disabled:pointer-events-none transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Floating: Status menu ────────────────────────────── */}
      {statusMenu && (
        <div
          ref={statusMenuRef}
          className="fixed z-[200] bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden w-36 py-1"
          style={{ top: statusMenu.top, right: statusMenu.right }}
        >
          {['draft', 'published', 'archived'].map(s => (
            <button key={s} onClick={() => changeStatus(statusMenu.productId, s)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors',
                activeProduct?.status === s ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              )}>
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sCfg(s).dot)} />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Floating: Action menu ────────────────────────────── */}
      {actionMenu && activeProduct && (
        <div
          ref={actionMenuRef}
          className="fixed z-[200] bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden w-52 py-1"
          style={{ top: actionMenu.top, right: actionMenu.right }}
        >
          <Link href={`/products/edit/${activeProduct.id}`} onClick={() => setActionMenu(null)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
            <Edit2 className="w-3.5 h-3.5 shrink-0" /> Edit product
          </Link>
          <button onClick={() => duplicateProduct(activeProduct)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
            <Copy className="w-3.5 h-3.5 shrink-0" /> Duplicate
          </button>
          <div className="border-t border-zinc-800/80 my-1" />
          <button onClick={() => copyUrl(activeProduct.slug)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
            <Link2 className="w-3.5 h-3.5 shrink-0" /> Copy URL
          </button>
          <a href={`https://ashmikafashion.com/products/${activeProduct.slug}`} target="_blank" rel="noopener noreferrer"
            onClick={() => setActionMenu(null)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5 shrink-0" /> View on site
          </a>
          {activeProduct.status !== 'archived' && (
            <>
              <div className="border-t border-zinc-800/80 my-1" />
              <button onClick={() => changeStatus(activeProduct.id, 'archived')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                <Archive className="w-3.5 h-3.5 shrink-0" /> Archive
              </button>
            </>
          )}
          <div className="border-t border-zinc-800/80 my-1" />
          <button onClick={() => deleteProduct(activeProduct.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <Trash2 className="w-3.5 h-3.5 shrink-0" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
