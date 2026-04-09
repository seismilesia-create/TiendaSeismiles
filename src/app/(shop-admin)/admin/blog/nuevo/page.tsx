import type { Metadata } from 'next'
import { BlogPostForm } from '@/features/shop/components/admin/BlogPostForm'

export const metadata: Metadata = { title: 'Nuevo articulo | Admin SEISMILES' }

export default function AdminBlogNewPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Nuevo articulo</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          Escribe un nuevo articulo para el blog de SEISMILES.
        </p>
      </div>

      <BlogPostForm />
    </div>
  )
}
