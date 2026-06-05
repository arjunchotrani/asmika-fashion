'use client'

import { useEffect, useState } from 'react'
import { Search, Archive, Package, MoreVertical, Edit2, RotateCcw } from 'lucide-react'
import { apiFetch } from '@/lib/api'

interface Product {
  id: string
  name: string
  price: number
  status: string
  main_image_url?: string
}

export default function ArchivedPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArchivedProducts()
  }, [])

  const fetchArchivedProducts = async () => {
    try {
      const res = await apiFetch('/api/products?status=archived')
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const restoreProduct = async (id: string) => {
    try {
      const res = await apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'draft' })
      })
      const data = await res.json()
      if (data.success) {
        setProducts(products.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error('Restore failed', err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Archived Products</h2>
        <p className="text-zinc-500 text-sm">Review and restore previously archived listings.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search archived products..." 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                [1, 2].map((i) => (
                  <tr key={i} className="animate-pulse h-16 bg-zinc-900/50" />
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-500 italic">
                    No archived products.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded border border-zinc-700 overflow-hidden flex items-center justify-center grayscale">
                          {product.main_image_url ? (
                            <img src={product.main_image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{product.name}</p>
                          <p className="text-[10px] text-zinc-600 uppercase font-bold">ARCHIVED</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => restoreProduct(product.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore
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
