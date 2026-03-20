import Image from 'next/image'
import Link from 'next/link'
import type { BlogPostRow } from '@/features/shop/services/blog'

const CATEGORY_LABELS: Record<string, string> = {
  cuidados: 'Cuidados',
  materiales: 'Materiales',
  estilo: 'Estilo',
  marca: 'Marca',
  general: 'General',
}

interface BlogCardProps {
  post: BlogPostRow
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300"
    >
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-sand-100">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-volcanic-800 to-volcanic-900 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 text-volcanic-600">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <span className="bg-terra-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white rounded-md">
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 lg:p-6">
        <div className="flex items-center gap-3 mb-3 text-body-xs text-volcanic-400">
          <span>{post.author_name}</span>
          <span className="w-1 h-1 rounded-full bg-volcanic-300" />
          <time>{formattedDate}</time>
        </div>

        <h3 className="text-body-lg font-semibold text-volcanic-900 group-hover:text-terra-500 transition-colors mb-2 line-clamp-2">
          {post.title}
        </h3>

        <p className="text-body-sm text-volcanic-500 leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>

        <div className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-semibold text-terra-500 group-hover:text-terra-600 transition-colors">
          Leer mas
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:translate-x-1">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
