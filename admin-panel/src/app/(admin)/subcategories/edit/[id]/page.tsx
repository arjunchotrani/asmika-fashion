'use client'

import { useEffect, useState, use } from 'react'
import SubcategoryForm from '@/components/forms/subcategory-form'
import { apiFetch } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function EditSubcategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [subcategory, setSubcategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubcategory = async () => {
      try {
        const res = await apiFetch(`/api/subcategories/${id}`)
        const data = await res.json()
        if (data.success) {
          setSubcategory(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch subcategory', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubcategory()
  }, [id])

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-800 animate-spin" />
      </div>
    )
  }

  if (!subcategory) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-zinc-500">
        <p>Subcategory not found.</p>
        <button onClick={() => window.history.back()} className="text-white font-medium underline">Go back</button>
      </div>
    )
  }

  return <SubcategoryForm initialData={subcategory} subcategoryId={id} />
}
