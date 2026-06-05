'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, Layers } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import Link from 'next/link'

interface Subcategory {
  id: string
  name: string
  slug: string
  category_name?: string
  category_id: string
}

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubcategories()
  }, [])

  const fetchSubcategories = async () => {
    try {
      const res = await apiFetch('/api/subcategories')
      const data = await res.json()
      if (data.success) {
        setSubcategories(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return
    
    try {
      const res = await apiFetch(`/api/subcategories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSubcategories(subcategories.filter(s => s.id !== id))
      } else {
        alert(data.message || 'Failed to delete subcategory')
      }
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Subcategories</h2>
          <p className="text-zinc-500 text-sm">Organize your products into specific niches.</p>
        </div>
        <Link 
          href="/subcategories/create"
          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subcategory
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search subcategories..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs">Total: {subcategories.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Parent Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse h-16 bg-zinc-900/50" />
                ))
              ) : subcategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 italic">
                    No subcategories found.
                  </td>
                </tr>
              ) : (
                subcategories.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">{sub.name}</td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3 h-3 text-zinc-600" />
                        {sub.category_name || 'Loading...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{sub.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/subcategories/edit/${sub.id}`}
                          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => deleteSubcategory(sub.id)}
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
