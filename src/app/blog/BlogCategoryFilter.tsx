'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { BlogCategory } from '@/features/shop/types'

interface Props {
  categories: BlogCategory[]
}

export function BlogCategoryFilter({ categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get('category')

  function handleFilter(categoryId: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 mb-10 flex-wrap">
      <button
        onClick={() => handleFilter(null)}
        className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${
          !activeCategory
            ? 'bg-volcanic-900 text-white'
            : 'bg-white border border-sand-200 text-volcanic-600 hover:border-volcanic-900/20'
        }`}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleFilter(cat.id)}
          className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${
            activeCategory === cat.id
              ? 'bg-volcanic-900 text-white'
              : 'bg-white border border-sand-200 text-volcanic-600 hover:border-volcanic-900/20'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
