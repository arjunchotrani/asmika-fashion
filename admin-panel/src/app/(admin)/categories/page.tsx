'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, MoreVertical, Edit2, Trash2, Layers, Loader2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  image_url?: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This might affect products linked to it.')) return
    
    try {
      const res = await apiFetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCategories(categories.filter(c => c.id !== id))
      } else {
        alert(data.message || 'Failed to delete category')
      }
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Categories</h2>
          <p className="text-zinc-500 text-sm">Manage your product categories and collections.</p>
        </div>
        <Link
          href="/categories/create"
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs">Total: {categories.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-10 h-10 bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-zinc-800 rounded w-8" /></td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 italic">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded border border-zinc-700 overflow-hidden flex items-center justify-center">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <Layers className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/categories/edit/${cat.id}`}
                          className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deleteCategory(cat.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
