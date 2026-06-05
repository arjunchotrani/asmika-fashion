'use client'

import { useEffect, useState, use } from 'react'
import CategoryForm from '@/components/forms/category-form'
import { apiFetch } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await apiFetch(`/api/categories/${id}`)
        const data = await res.json()
        if (data.success) {
          setCategory(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch category', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [id])

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-800 animate-spin" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500">
        <p>Category not found.</p>
        <button onClick={() => window.history.back()} className="text-white font-medium underline">Go back</button>
      </div>
    )
  }

  return <CategoryForm initialData={category} categoryId={id} />
}
