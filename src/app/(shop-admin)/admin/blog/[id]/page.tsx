import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminPost } from '@/features/shop/services/blog'
import { BlogPostForm } from '@/features/shop/components/admin/BlogPostForm'

export const metadata: Metadata = { title: 'Editar articulo | Admin Seismiles' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminBlogEditPage({ params }: Props) {
  const { id } = await params
  const post = await getAdminPost(id)

  if (!post) notFound()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Editar articulo</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          Modifica el contenido del articulo.
        </p>
      </div>

      <BlogPostForm post={post} />
    </div>
  )
}
