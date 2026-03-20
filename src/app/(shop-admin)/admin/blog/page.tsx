import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminPosts } from '@/features/shop/services/blog'
import { BlogPostsTable } from '@/features/shop/components/admin/BlogPostsTable'

export const metadata: Metadata = { title: 'Blog | Admin Seismiles' }

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  )
}

export default async function AdminBlogPage() {
  const posts = await getAdminPosts()

  const publishedCount = posts.filter(p => p.is_published).length
  const draftCount = posts.length - publishedCount

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl text-volcanic-900">Blog</h1>
          <p className="text-body-sm text-volcanic-500 mt-1">
            {posts.length === 0
              ? 'Sin articulos aun'
              : `${publishedCount} publicado${publishedCount !== 1 ? 's' : ''}, ${draftCount} borrador${draftCount !== 1 ? 'es' : ''}`
            }
          </p>
        </div>
        <Link
          href="/admin/blog/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo articulo
        </Link>
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white border border-sand-200/60">
          <p className="text-body-sm text-volcanic-500 mb-4">No hay articulos aun.</p>
          <Link
            href="/admin/blog/nuevo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-terra-500 hover:bg-terra-600 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
          >
            <PlusIcon className="w-4 h-4" />
            Crear primer articulo
          </Link>
        </div>
      ) : (
        <BlogPostsTable posts={posts} />
      )}
    </div>
  )
}
