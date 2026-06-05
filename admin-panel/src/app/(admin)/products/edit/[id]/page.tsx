'use client'

import { useEffect, useState, use } from 'react'
import ProductForm from '@/components/forms/product-form'
import { apiFetch } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiFetch(`/api/products/${id}`)
        const data = await res.json()
        if (data.success) {
          setProduct(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch product', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-800 animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500">
        <p>Product not found.</p>
        <button onClick={() => window.history.back()} className="text-white font-medium underline">Go back</button>
      </div>
    )
  }

  return <ProductForm initialData={product} productId={id} />
}
